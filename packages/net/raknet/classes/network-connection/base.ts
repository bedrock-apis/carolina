export class DeferredRunner {
   public readonly schedule: (func: () => void) => unknown;
   public readonly task: () => void;

   protected isQueued = false; // cancellation flag
   protected wasQueued = false; // tracks if a schedule was made

   public constructor(schedule: (func: () => void) => unknown, task: () => void) {
      this.schedule = schedule;
      this.task = task;
   }

   /** Queue the task for deferred execution */
   public defer(): void {
      // We allow the task to be run if already scheduled
      this.isQueued = true;

      // If wasn't scheduled then we create new schedule
      if (!this.wasQueued) {
         this.wasQueued = true;
         this.schedule(() => {
            const _ = this.isQueued;

            // Reset variables before task so we sure when the task throws we are not effected.
            this.isQueued = this.wasQueued = false;

            // Only if allowed to run
            if (_) this.task();
         });
      }
   }

   /** Run immediately, cancelling any deferred execution */
   public run(): void {
      this.isQueued = false; // cancel any pending deferred run
      this.task();
   }
}

export class MicrotaskDeferredRunner extends DeferredRunner {
   public constructor(method: () => void) {
      super(queueMicrotask, method);
   }
}

import { ConnectionEndpoint, NetworkConnection } from '../../../api/interface';
import {
   ACK_DATAGRAM_BIT,
   IS_ORDERED_EXCLUSIVE_LOOKUP,
   IS_SEQUENCED_LOOKUP,
   MAX_CAPSULE_HEADER_SIZE,
   MAX_FRAME_SET_HEADER_SIZE,
   NACK_DATAGRAM_BIT,
   ONLINE_DATAGRAM_BIT_MASK,
   VALID_DATAGRAM_BIT,
} from '../../constants';
import { RakNetConnectedPacketId, RakNetReliability, RakNetUnconnectedPacketId } from '../../enums';
import { FrameDescriptor } from '../../interfaces';
import {
   getChunkIterator,
   readACKLikePacket,
   readCapsuleFrameHeader,
   readUint24,
   rentAcknowledgePacketWith,
   writeCapsuleFrameHeader,
   writeUint24,
} from '../../proto';
import { CircularBufferQueue } from '../circular-buffer-queue';
import { EndpointHandle } from '../endpoint';
import { FragmentMeta } from '../fragment-meta';

let LAST_RUNTIME_ID_INCREMENT = 0;
export class RakNetNetworkConnection implements NetworkConnection {
   //#region Interface
   public readonly uniqueId: string;
   public readonly runtimeId: number = LAST_RUNTIME_ID_INCREMENT++;
   public readonly endpoint: ConnectionEndpoint;
   public readonly handle: EndpointHandle;
   public readonly guid: bigint;
   public mtu = 1400; // It's default MTU, but it would be overwritten anyway
   public constructor(handle: EndpointHandle, endpoint: ConnectionEndpoint, guid: bigint) {
      this.endpoint = endpoint;
      this.handle = handle;
      this.guid = guid;
      this.uniqueId = new.target.getUniqueIdFromEndpoint(endpoint);
   }
   public getAddress(): string | null {
      return this.endpoint.address;
   }
   public getPort(): number | null {
      return this.endpoint.port;
   }
   public getPing(): number | null {
      return null;
   }
   //#endregion
   //#region Payload Processing
   public readonly unacknowledgedWindowSize: number = 512;
   //#region Incoming logic
   protected readonly incomingFragmentRebuildTable: Map<number, FragmentMeta> = new Map();
   protected readonly incomingReceivedDatagram: Record<number, boolean> = Object.create(null);
   protected readonly incomingReceivedDatagramAcknowledgeStack: Array<number> = []; // Fast append, fast iterating
   protected readonly incomingMissingDatagram: Set<number> = new Set(); // Fast unordered deletions, insertions
   protected incomingLastDatagramId = -1;
   public incomingLastActivity: number = performance.now();
   //protected incomingNextFragmentId: number = 0;
   //#region FrameSet Handlers
   /**
    * Base handler for raw incoming packets, internal usage!
    * @param msg buffer
    * @returns void
    * @internal
    */
   public process(message: Uint8Array): void {
      const mask = message[0] & ONLINE_DATAGRAM_BIT_MASK;
      this.incomingLastActivity = performance.now();
      if (mask === VALID_DATAGRAM_BIT) return void this.processFrameSet(message);

      if ((mask & ACK_DATAGRAM_BIT) === ACK_DATAGRAM_BIT) return void this.processACK(message);

      if ((mask & NACK_DATAGRAM_BIT) === NACK_DATAGRAM_BIT) return void this.processNACK(message);
   }
   protected processACK(_: Uint8Array): void {
      for (const { min, max } of readACKLikePacket(_))
         for (let i = min; i <= max; i++) {
            this.outgoingUnacknowledgedReliableCapsules -= this.outgoingUnacknowledgedCache[i]?.length ?? 0;
            delete this.outgoingUnacknowledgedCache[i];
            this.flushQueueScheduler.defer();
         }
   }
   protected processNACK(_: Uint8Array): void {
      const packets = readACKLikePacket(_);
      // reverse outer loop
      for (let p = packets.length - 1; p >= 0; p--) {
         const { min, max } = packets[p];

         // reverse range loop
         for (let i = max; i >= min; i--) {
            const list = this.outgoingUnacknowledgedCache[i];
            delete this.outgoingUnacknowledgedCache[i];
            // reverse capsule loop
            if (list)
               for (let c = list.length - 1; c >= 0; c--) this.outgoingToSendStack.reverseEnqueue(list[c]);
         }
         this.flushQueueScheduler.defer();
      }
   }
   protected processFrameSet(msg: Uint8Array): void {
      const dataview = new DataView(msg.buffer, msg.byteOffset, msg.byteLength);
      const id = readUint24(dataview, 1);
      // In theory the connection would have to be at least 2 days of active playing, more like the MC client would crash
      if (id > 0xffffe0)
         console.warn(
            'Fatal warning, frame sets ids are about to overflow uint24, i personally have no idea what to do, please contact developers team.'
         );

      const frameIndex = id & 0xff,
         correctionIndex = (id + this.unacknowledgedWindowSize) & 0xff;

      // Deletes if the cycle repeats
      delete this.incomingReceivedDatagram[correctionIndex];

      // Check for duplicate frames
      if (this.incomingReceivedDatagram[frameIndex])
         // TODO: We shouldn't throw as it would break the workflow
         console.error(new ReferenceError('Duplicated frame set received'));

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
      while (offset < dataview.byteLength) offset = this.processCapsule(dataview, offset);
      this.acknowledgeFlushScheduler.defer();
   }
   protected processCapsule(view: DataView, offset: number): number {
      const data = readCapsuleFrameHeader(view, offset);

      // Check if the capsule is fragmented
      if (data.fragment) this.processFragment(data);
      else this.processFrame(data);

      // return updated offset
      return data.offset;
   }
   protected processFragment(data: FrameDescriptor): void {
      const { body, fragment } = data;
      // Can't handle frames with no fragmentation
      //TODO - We should consider using some kind of error handler
      if (!fragment) return void console.error(new ReferenceError('This frame descriptor is not a fragment'));

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
         this.processFrame(data);
      }
   }
   protected processCurrentAcknowledge(): void {
      // Acknowledge received packets
      if (this.incomingReceivedDatagramAcknowledgeStack.length) {
         // Rent acknowledge buffer
         const buffer = rentAcknowledgePacketWith(
            RakNetUnconnectedPacketId.AckDatagram,
            RakNetNetworkConnection.getRangesFromSequence(
               this.incomingReceivedDatagramAcknowledgeStack.values()
            )
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
            RakNetNetworkConnection.getRangesFromSequence(this.incomingMissingDatagram.values())
         );

         this.sendToSocket(buffer);
         // Clear the set
         this.incomingMissingDatagram.clear();
      }
   }
   /**  Should be used for overriding */
   protected processFrame(_: FrameDescriptor): void {}
   //#endregion

   //#region Outgoing logic
   protected readonly outgoingBuffer: Uint8Array = new Uint8Array(1024 + 512);
   protected readonly outgoingBufferDataView: DataView = new DataView(this.outgoingBuffer.buffer);
   protected readonly outgoingUnacknowledgedCache: Record<number, Array<CapsuleCache>> = Object.create(null);
   protected readonly outgoingToSendStack: CircularBufferQueue<CapsuleCache> =
      new CircularBufferQueue<CapsuleCache>(1024);
   protected outgoingUnacknowledgedReliableCapsules = 0;
   protected get outgoingBufferAvailableSize(): number {
      return this.outgoingMTU - this.outgoingBufferCursor;
   }
   protected outgoingUnacknowledgedStack: Array<CapsuleCache> = [];
   protected outgoingBufferCursor = 4; // Frameset packet id + uint24 frameset id
   protected outgoingFrameSetId = 0;

   protected outgoingChannelIndex = 0;
   protected outgoingNextFragmentId = 0;
   protected outgoingOrderChannels: Record<number, number> = Object.create(null);
   protected outgoingSequenceChannels: Record<number, number> = Object.create(null);
   protected outgoingReliableIndex = 0;
   protected outgoingMTU: number = this.outgoingBuffer.length;

   protected readonly flushStackScheduler: DeferredRunner = new DeferredRunner(
      queueMicrotask,
      this.batchCurrentBuffer.bind(this)
   );
   protected readonly flushQueueScheduler: DeferredRunner = new DeferredRunner(
      setImmediate,
      this.processQueue.bind(this)
   );
   protected readonly acknowledgeFlushScheduler: DeferredRunner = new DeferredRunner(
      res => setTimeout(res, 1),
      this.processCurrentAcknowledge.bind(this)
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
         // We know what we are doing so we can disable it for this lines
         // oxlint-disable-next-line typescript/no-non-null-assertion
         body: null!,
         // oxlint-disable-next-line typescript/no-non-null-assertion
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
         let index = 0;

         for (const chunk of getChunkIterator(data, chunkSize)) {
            const fragment_meta = Object.create(meta);
            fragment_meta.fragment = { id, index, length: fragmentCount };
            // set
            fragment_meta.body = chunk;
            fragment_meta.reliableIndex = this.outgoingReliableIndex++;

            // send
            this.enqueueCapsule(fragment_meta, reliability);

            // increment chunk id
            index++;
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
      while (!this.outgoingToSendStack.isEmpty() && this.outgoingUnacknowledgedReliableCapsules < 2) {
         // We know what we are doing so we can disable it for this line
         // oxlint-disable-next-line typescript/no-non-null-assertion
         const capsule = this.outgoingToSendStack.dequeue()!;
         // There is a less space than 1 byte for payload then send the buffer immediately
         if (this.outgoingBufferAvailableSize <= MAX_CAPSULE_HEADER_SIZE + capsule.frame.body.length)
            this.batchCurrentBuffer();

         this.consumeCapsule(capsule);
      }

      // Trigger flush of internal buffer for next tick
      if (this.outgoingBufferCursor > 4) this.flushStackScheduler.defer();
   }
   protected consumeCapsule(data: { frame: FrameDescriptor; reliability: number }): void {
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
         data.reliability
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
   }
   protected sendToSocket(data: Uint8Array): void {
      this.handle.send(data, this.endpoint);
   }
   //#endregion
   /**
    * Explicit logic for disconnecting connection
    */
   public disconnect(): void {
      this.enqueueFrame(new Uint8Array([RakNetConnectedPacketId.Disconnect]), RakNetReliability.Unreliable);
   }

   /**
    * After connection has disconnected or we disconnected it then clean the resources
    */
   public dispose(): void {
      this.flushQueueScheduler.run();
      this.flushStackScheduler.run();
      this.acknowledgeFlushScheduler.run();
      // Clean resources
   }
   public send(data: Uint8Array, reliability?: RakNetReliability): void {
      this.enqueueFrame(data, reliability ?? RakNetReliability.ReliableOrdered);
   }

   //#region Static
   public static getUniqueIdFromEndpoint(endpoint: ConnectionEndpoint): string {
      return `${endpoint.address}#${endpoint.port}`;
   }
   protected static *getRangesFromSequence(
      sequence: Iterator<number>
   ): Generator<{ min: number; max: number }, number> {
      let v = sequence.next();
      if (v.done) return 0;

      // min for range
      let min = v.value,
         max = min;
      let i = 1;
      while (true) {
         v = sequence.next();
         if (v.done) break;
         const current = v.value;
         const dif = current - max;
         if (dif === 1) max = current;
         else if (dif > 1) {
            yield { min, max };
            i++;
            min = max = current;
         }
      }
      yield { min, max };
      return i;
   }
   //#endregion
}

interface CapsuleCache {
   frame: FrameDescriptor;
   reliability: number;
}
