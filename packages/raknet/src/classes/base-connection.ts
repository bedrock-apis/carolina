// We access this file directly because we don't want to rely on whole @package/common
import { DeferredRunner } from '../../../common/src/deferred-runner';
import { nextTick } from 'node:process';
import {
   ACK_DATAGRAM_BIT,
   IS_ORDERED_EXCLUSIVE_LOOKUP,
   IS_SEQUENCED_LOOKUP,
   MAX_CAPSULE_HEADER_SIZE,
   MAX_FRAME_SET_HEADER_SIZE,
   NACK_DATAGRAM_BIT,
   ONLINE_DATAGRAM_BIT_MASK,
   VALID_DATAGRAM_BIT,
} from '../constants';
import { RakNetConnectedPacketId, RakNetReliability, RakNetUnconnectedPacketId } from '../enums';
import { AddressInfo, FrameDescriptor, SocketSource } from '../interfaces';
import { getChunkIterator, readCapsuleFrameData, writeCapsuleFrameHeader } from '../proto';
import { readACKLikePacket, rentAcknowledgePacketWith } from '../proto/acknowledge';
import { readUint24, writeUint24 } from '../proto/uint24';
import { FragmentMeta } from './fragment-meta';

type CapsuleCache = { frame: FrameDescriptor; reliability: number };
export abstract class BaseConnection {
   public onErrorHandle?: (error: Error) => void;
   public onConnectionEstablishedHandle?: () => void;
   /** Don't use colon ":" as separator as it's valid character for IPv6 address*/
   public static getIdentifierFor: (address: AddressInfo) => string = _ => `${_.address}#${_.port}`;
   public constructor(
      public readonly source: SocketSource,
      public readonly endpoint: AddressInfo,
      public readonly guid: bigint,
   ) {
      this.id = new.target.getIdentifierFor(endpoint);
      this.outgoingBuffer[0] = VALID_DATAGRAM_BIT;
   }
   public readonly id: string;
   public readonly unacknowledgedWindowSize: number = 512;
   //#region Incoming logic
   protected readonly incomingFragmentRebuildTable: Map<number, FragmentMeta> = new Map();
   protected readonly incomingReceivedDatagram: Record<number, boolean> = Object.create(null);
   protected readonly incomingReceivedDatagramAcknowledgeStack: Array<number> = []; // Fast append, fast iterating
   protected readonly incomingMissingDatagram: Set<number> = new Set(); // Fast unordered deletions, insertions
   protected incomingLastDatagramId: number = -1;
   //protected incomingNextFragmentId: number = 0;
   //#region FrameSet Handlers
   /**
    * Base handler for raw incoming packets, internal usage!
    * @param msg buffer
    * @returns void
    * @internal
    */
   public handleIncoming(msg: Uint8Array): void {
      const mask = msg[0] & ONLINE_DATAGRAM_BIT_MASK;
      if (mask === VALID_DATAGRAM_BIT) return void this.handleFrameSet(msg);

      if ((mask & ACK_DATAGRAM_BIT) === ACK_DATAGRAM_BIT) return void this.handleAck(msg);

      if ((mask & NACK_DATAGRAM_BIT) === NACK_DATAGRAM_BIT) return void this.handleNack(msg);
   }
   protected handleAck(_: Uint8Array): void {
      for (const { min, max } of readACKLikePacket(_))
         for (let i = min; i <= max; i++) {
            this.outgoingUnacknowledgedReliableCapsules -= this.outgoingUnacknowledgedCache[i].length ?? 0;
            delete this.outgoingUnacknowledgedCache[i];
            this.flushQueueScheduler.defer();
         }
   }
   protected handleNack(_: Uint8Array): void {
      const packets = readACKLikePacket(_);

      // reverse outer loop
      for (let p = packets.length - 1; p >= 0; p--) {
         const { min, max } = packets[p];

         // reverse range loop
         for (let i = max; i >= min; i--) {
            const list = this.outgoingUnacknowledgedCache[i];
            delete this.outgoingUnacknowledgedCache[i];
            // reverse capsule loop
            if (list) for (let c = list.length - 1; c >= 0; c--) this.outgoingToSendStack.reverseEnqueue(list[c]);
         }
         this.flushQueueScheduler.defer();
      }
   }
   protected handleFrameSet(msg: Uint8Array): void {
      const dataview = new DataView(msg.buffer, msg.byteOffset, msg.byteLength);
      const id = readUint24(dataview, 1);

      // In theory the connection would have to be at least 2 days of active playing, more like the MC client would crash
      if (id > 0xffffe0)
         console.warn(
            'Fatal warning, frame sets ids are about to overflow uint24, i personally have no idea what to do, please contact developers team.',
         );

      const frameIndex = id & 0xff,
         correctionIndex = (id + this.unacknowledgedWindowSize) & 0xff;

      // Deletes if the cycle repeats
      delete this.incomingReceivedDatagram[correctionIndex];

      // Check for duplicate frames
      if (this.incomingReceivedDatagram[frameIndex])
         this.onErrorHandle?.(new ReferenceError('Duplicated frame set received'));

      // register frame set as received
      this.incomingReceivedDatagram[frameIndex] = true;

      // If we didn't flush yet and this packet was missing we can optimize it by removing id that we thought it got lost.
      this.incomingMissingDatagram.delete(id);

      // Some packets might be skipped
      if (id - this.incomingLastDatagramId > 1)
         for (let i = this.incomingLastDatagramId + 1; i < id; i++) this.incomingMissingDatagram.add(i);

      // update lastMessageId
      this.incomingReceivedDatagramAcknowledgeStack.push((this.incomingLastDatagramId = id));

      // handle each capsule
      let offset = 4;
      while (offset < dataview.byteLength) offset = this.handleCapsule(dataview, offset);
      this.acknowledgeFlushScheduler.defer();
   }
   protected handleCapsule(view: DataView, offset: number): number {
      const data = readCapsuleFrameData(view, offset);

      // Check if the capsule is fragmented
      if (data.fragment) this.handleFragment(data);
      else this.handleFrame(data);

      // return updated offset
      return data.offset;
   }
   protected handleFragment(data: FrameDescriptor): void {
      const { body, fragment } = data;

      // Can't handle frames with no fragmentation
      //TODO - We should consider using some kind of error handler
      if (!fragment) return this.onErrorHandle?.(new ReferenceError('This frame descriptor is not a fragment'));

      // get fragment cache
      let meta = this.incomingFragmentRebuildTable.get(fragment.id);
      // Create new fragment meta table
      if (!meta) this.incomingFragmentRebuildTable.set(fragment.id, (meta = new FragmentMeta()));

      // Set fragment data
      meta.set(fragment.index, body);

      // Build whole buffer and remove fragment cache from table
      if (meta.length >= fragment.length) {
         // remove registered meta
         this.incomingFragmentRebuildTable.delete(fragment.id);

         // Build whole packet data and handle frame
         data.body = meta.build();

         // handle frame
         this.handleFrame(data);
      }
   }
   protected processCurrentAcknowledge(): void {
      // Acknowledge received packets
      if (this.incomingReceivedDatagramAcknowledgeStack.length) {
         // Rent acknowledge buffer
         const buffer = rentAcknowledgePacketWith(
            RakNetUnconnectedPacketId.AckDatagram,
            BaseConnection.getRangesFromSequence(this.incomingReceivedDatagramAcknowledgeStack.values()),
         );
         //Send
         this.sendToSocket(buffer);
         // Clear the array
         this.incomingReceivedDatagramAcknowledgeStack.length = 0;
      }

      // Acknowledge packet that missing
      if (this.incomingMissingDatagram.size) {
         // Rent acknowledge buffer
         const buffer = rentAcknowledgePacketWith(
            RakNetUnconnectedPacketId.NackDatagram,
            BaseConnection.getRangesFromSequence(this.incomingMissingDatagram.values()),
         );

         this.sendToSocket(buffer);
         // Clear the set
         this.incomingMissingDatagram.clear();
      }
   }
   /**  Should be used for overriding */
   protected handleFrame(_: FrameDescriptor): void {}
   //#endregion

   //#endregion
   //#region Outgoing logic
   protected readonly outgoingBuffer: Uint8Array = new Uint8Array(1024 + 512);
   protected readonly outgoingBufferDataView: DataView = new DataView(this.outgoingBuffer.buffer);
   protected readonly outgoingUnacknowledgedCache: Record<number, Array<CapsuleCache>> = Object.create(null);
   protected readonly outgoingToSendStack: CircularBufferQueue<CapsuleCache> = new CircularBufferQueue<CapsuleCache>(
      1024,
   );
   protected outgoingUnacknowledgedReliableCapsules: number = 0;
   protected get outgoingBufferAvailableSize(): number {
      return this.outgoingMTU - this.outgoingBufferCursor;
   }
   protected outgoingUnacknowledgedStack: Array<CapsuleCache> = [];
   protected outgoingBufferCursor: number = 4; // Frameset packet id + uint24 frameset id
   protected outgoingFrameSetId: number = 0;

   protected outgoingChannelIndex: number = 0;
   protected outgoingNextFragmentId: number = 0;
   protected outgoingOrderChannels: Record<number, number> = Object.create(null);
   protected outgoingSequenceChannels: Record<number, number> = Object.create(null);
   protected outgoingReliableIndex: number = 0;
   protected outgoingMTU: number = this.outgoingBuffer.length;

   protected readonly flushStackScheduler: DeferredRunner = new DeferredRunner(
      nextTick,
      this.batchCurrentBuffer.bind(this),
   );
   protected readonly flushQueueScheduler: DeferredRunner = new DeferredRunner(
      setImmediate,
      this.processQueue.bind(this),
   );
   protected readonly acknowledgeFlushScheduler: DeferredRunner = new DeferredRunner(
      nextTick,
      this.processCurrentAcknowledge.bind(this),
   );

   protected enqueueFrame(data: Uint8Array, reliability: number): void {
      // Request flush at the end of this tick
      this.flushQueueScheduler.defer();

      // Ensure proper indexing
      if (this.outgoingOrderChannels[this.outgoingChannelIndex] === undefined)
         this.outgoingSequenceChannels[this.outgoingChannelIndex] = this.outgoingOrderChannels[
            this.outgoingChannelIndex
         ] = 0;

      // Base send info initialization
      const meta: FrameDescriptor = {
         body: null!,
         fragment: null!,
         orderChannel: this.outgoingChannelIndex,
         orderIndex: 0,
         reliableIndex: 0, // Change before sending each of single payloads/fragments
         sequenceIndex: 0,
      };

      // Check if sequenced
      if (IS_SEQUENCED_LOOKUP[reliability]) {
         meta.orderIndex = this.outgoingOrderChannels[this.outgoingChannelIndex];
         meta.sequenceIndex = this.outgoingSequenceChannels[this.outgoingChannelIndex]++;
      }

      // Check if ordered only
      if (IS_ORDERED_EXCLUSIVE_LOOKUP[reliability]) {
         meta.orderIndex = this.outgoingOrderChannels[this.outgoingChannelIndex]++;
         this.outgoingSequenceChannels[this.outgoingChannelIndex] = 0;
      }

      // Fragmented payload
      if (data.length >= this.outgoingMTU - MAX_FRAME_SET_HEADER_SIZE) {
         // payload size + 13 capsule header + 4 datagram id and datagram packet id

         // Max chunk size per fragment
         const chunkSize = this.outgoingMTU - MAX_FRAME_SET_HEADER_SIZE; // 10 + fragment meta information in header

         // Number of total fragments for this payload
         const fragmentCount = Math.ceil(data.length / chunkSize);

         // Current Id of the fragment
         const id = this.outgoingNextFragmentId++;

         // Each object must be unique
         let fragment_meta = Object.create(meta);
         fragment_meta.fragment = {
            id,
            index: 0,
            length: fragmentCount,
         };

         for (const chunk of getChunkIterator(data, chunkSize)) {
            // set
            meta.body = chunk;
            meta.reliableIndex = this.outgoingReliableIndex++;

            // send
            this.enqueueCapsule(fragment_meta, reliability);

            // increment chunk id
            fragment_meta.fragment.index++;
            // TODO: Yield
         }

         return;
      }

      //queue capsule
      meta.reliableIndex = this.outgoingReliableIndex++;
      meta.body = data;
      this.enqueueCapsule(meta, reliability);
   }
   protected enqueueCapsule(descriptor: FrameDescriptor, reliability: number): void {
      this.outgoingToSendStack.enqueue({ frame: descriptor, reliability });
   }
   protected processQueue(): void {
      while (
         !this.outgoingToSendStack.isEmpty() &&
         this.outgoingUnacknowledgedReliableCapsules < this.unacknowledgedWindowSize
      ) {
         const capsule = this.outgoingToSendStack.dequeue()!;
         // There is a less space than 1 byte for payload then send the buffer immediately
         if (this.outgoingBufferAvailableSize <= MAX_CAPSULE_HEADER_SIZE + capsule.frame.body.length)
            this.batchCurrentBuffer();

         this.processCapsule(capsule);
      }

      // Trigger flush of internal buffer for next tick
      if (this.outgoingBufferCursor > 4) this.flushStackScheduler.defer();
   }
   protected processCapsule(data: { frame: FrameDescriptor; reliability: number }): void {
      // Save only reliable packets
      if (
         data.reliability !== RakNetReliability.Unreliable &&
         data.reliability !== RakNetReliability.UnreliableSequenced
      ) {
         this.outgoingUnacknowledgedStack.push(data);
         this.outgoingUnacknowledgedReliableCapsules++;
      }

      // Write capsule header
      this.outgoingBufferCursor = writeCapsuleFrameHeader(
         this.outgoingBufferCursor,
         this.outgoingBufferDataView,
         data.frame,
         data.frame.body.length,
         data.reliability,
      );
      // Set body
      this.outgoingBuffer.set(data.frame.body, this.outgoingBufferCursor);

      // update offset
      this.outgoingBufferCursor += data.frame.body.length;
   }
   protected batchCurrentBuffer(): void {
      // No data to send
      if (this.outgoingBufferCursor <= 4) return;
      this.outgoingBuffer[0] = VALID_DATAGRAM_BIT;

      // Save under the sequence id
      this.outgoingUnacknowledgedCache[this.outgoingFrameSetId] = this.outgoingUnacknowledgedStack;
      this.outgoingUnacknowledgedStack = [];

      writeUint24(this.outgoingBufferDataView, 1, this.outgoingFrameSetId++);
      this.sendToSocket(this.outgoingBuffer.subarray(0, this.outgoingBufferCursor));

      //Reset the cursor
      this.outgoingBufferCursor = 4;
      console.log('Batched: ' + this.outgoingToSendStack.isEmpty());
   }
   protected sendToSocket(data: Uint8Array): void {
      this.source.send(data, this.endpoint);
   }
   //#endregion
   //#region General
   protected close(): void {
      this.flushQueueScheduler.run();
      this.flushStackScheduler.run();
      this.acknowledgeFlushScheduler.run();
   }
   public disconnect(): void {
      // Send close packet!
      //TODO: Send Disconnect packet
      this.enqueueFrame(new Uint8Array([RakNetConnectedPacketId.Disconnect]), RakNetReliability.Unreliable);
      // Close this connection
      this.close();
   }
   public send(data: Uint8Array, reliability: RakNetReliability): void {
      this.enqueueFrame(data, reliability);
   }
   //#endregion
   protected static *getRangesFromSequence(
      sequence: Iterator<number>,
   ): Generator<{ min: number; max: number }, number> {
      let v = sequence.next();
      if (v.done) return 0;

      // min for range
      let min = v.value,
         max = min;
      let i = 1;
      do {
         v = sequence.next();
         const current = v.value;
         const dif = current - min;
         if (dif === 1) max = current;
         else if (dif > 1) {
            yield { min, max };
            i++;
            min = max = current;
         }
      } while (!v.done);
      yield { min, max };
      return i;
   }
}

export class CircularBufferQueue<T> {
   protected readonly buffer: Array<T | undefined>;
   protected headCursor: number = 0;
   protected tailCursor: number = 0;
   protected size: number = 0;
   public constructor(capacity: number) {
      this.buffer = new Array(capacity);
   }
   public reverseEnqueue(item: T): boolean {
      if (this.size === this.buffer.length) return false;
      this.buffer[this.tailCursor] = item;
      this.tailCursor = (this.buffer.length + this.tailCursor - 1) % this.buffer.length;
      this.size++;
      return true;
   }
   public enqueue(item: T): boolean {
      if (this.size === this.buffer.length) return false;
      this.buffer[this.headCursor] = item;
      this.headCursor = (this.headCursor + 1) % this.buffer.length;
      this.size++;
      return true;
   }
   public dequeue(): T | null {
      if (this.size === 0) return null;
      const item = this.buffer[this.tailCursor];

      this.buffer[this.tailCursor] = undefined; // optional cleanup
      this.tailCursor = (this.tailCursor + 1) % this.buffer.length;
      this.size--;
      return item ?? null;
   }

   public peek(): T | null {
      return this.buffer[this.tailCursor] ?? null;
   }
   public isEmpty(): boolean {
      return this.size === 0;
   }
}
