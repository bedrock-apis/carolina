import type { Socket } from "node:dgram";
import type { AddressInfo } from "node:net";
import { ACK_DATAGRAM_BIT, CAPSULE_FRAGMENT_META_SIZE, iS_ORDERED_EXCLUSIVE_LOOKUP, IS_ORDERED_LOOKUP, IS_SEQUENCED_LOOKUP, MAX_CAPSULE_HEADER_SIZE, MAX_FRAME_SET_HEADER_SIZE, NACK_DATAGRAM_BIT, ONLINE_DATAGRAM_BIT_MASK, UDP_HEADER_SIZE, VALID_DATAGRAM_BIT } from "../constants";
import { RakNetUtils } from "../proto";
import { FrameDescriptor } from "../interfaces";
import { FragmentMeta } from "./fragment-meta";
import { RakNetConnectedPacketId, RakNetReliability, RakNetUnconnectedPacketId } from "../enums";
import { RakNetServer } from "./server";

export class RakNetConnection {
    //#region Initialization
    static {
        // Export private/protected internal fields
        internalHandleIncoming = Function.call.bind(this.prototype.handleIncoming);
    }
    // Id used in raknet server as key for lookup table, its based on address and port
    public readonly id: string;
    public readonly port: number;
    public readonly internetProtocolAddress: string;
    public readonly internetProtocolVersion: 4 | 6;

    protected readonly fragmentTable: Map<number, FragmentMeta> = new Map();
    protected lastDatagramId: number = -1;
    protected nextFragmentId: number = 0;
    protected missingDatagramQueue: Set<number>; // Requires fast access and removal specific value without knowing its [index].
    protected receivedDatagramQueue: Array<number>; // used a lot, use Array for performance benefits
    protected receivedDatagram: Record<number, boolean> = Object.create(null);

    protected outgoingChannelIndex: number = 0;
    protected outgoingOrderChannels: Record<number, number> = Object.create(null);
    protected outgoingSequenceChannels: Record<number, number> = Object.create(null);
    protected outgoingReliableIndex: number = 0;
    protected outgoingFrameId: number = 0;

    protected datagramReadyBuffer: Uint8Array;
    protected datagramReadyBufferOffset = 0;
    protected resendCache: Record<number, Uint8Array> = Object.create(null);
    protected readonly maxPayloadSize: number;
    protected get datagramReadyBufferAvailableLength(): number {
        return (this.datagramReadyBuffer.length - this.datagramReadyBufferOffset);
    }
    protected constructor(
        protected readonly server: RakNetServer,
        protected readonly socket: Socket,
        mtu: number,
        public readonly guid: bigint,
        public readonly address: AddressInfo
    ){
        this.id = RakNetUtils.getFullAddressFor(address);
        this.internetProtocolAddress = address.address;
        this.internetProtocolVersion = address.family === "IPv4"?4:6;
        this.port = address.port;
        this.maxPayloadSize = mtu - UDP_HEADER_SIZE;

        this.missingDatagramQueue = new Set();
        this.receivedDatagramQueue = [];
        this.datagramReadyBuffer = this.createReadyFrameSetBuffer();
        this.datagramReadyBufferOffset = 4;
    }
    //#endregion

    //#region FrameSet Handlers
    /**
     * Base handler for raw incoming packets, internal usage!
     * @param msg buffer
     * @returns void
     */
    protected handleIncoming(msg: Uint8Array): void{
        const mask = msg[0] & ONLINE_DATAGRAM_BIT_MASK;
        if(mask === VALID_DATAGRAM_BIT) return void this.handleFrameSet(msg);

        if((mask & ACK_DATAGRAM_BIT) === ACK_DATAGRAM_BIT)
            return void this.handleAck(msg);

        if((mask & NACK_DATAGRAM_BIT) === NACK_DATAGRAM_BIT)
            return void this.handleNack(msg);
    }
    protected handleAck(_: Uint8Array): void{
        for(const {min, max} of RakNetUtils.readACKLikePacket(_))
            for(let i = min; i <= max; i++)
                delete this.resendCache[i];
    }
    protected handleNack(_: Uint8Array): void{
        for(const {min, max} of RakNetUtils.readACKLikePacket(_))
            for(let i = min; i <= max; i++)
            {
                this.internalSendAsFrameSet(this.resendCache[i]);
                delete this.resendCache[i];
            }
    }
    protected handleFrameSet(msg: Uint8Array): void{
        const dataview = new DataView(msg.buffer, msg.byteOffset, msg.byteLength);
        const id = RakNetUtils.readUint24(dataview, 1);

        if(id > 0xffffe0) console.warn("Fatal warning, frame sets ids are about to overflow uint24, please contact developers team.");

        const frameIndex = (id) & 0xff, correctionIndex = (id + 128) & 0xff;
        
        // Deletes if the cycle repeats
        delete this.receivedDatagram[correctionIndex];
        
        // Check for duplicate frames
        if(this.receivedDatagram[frameIndex]) throw new ReferenceError("Duplicated frame set received");
        
        // register frame set as received
        this.receivedDatagram[frameIndex] = true;

        // If we didn't flush yet and this packet was missing we can optimize it by removing id that we thought it got lost.
        this.missingDatagramQueue.delete(id);

        // Some packets might be skipped
        if(id - this.lastDatagramId > 1) 
            for(let i = this.lastDatagramId + 1; i < id; i++) 
                this.missingDatagramQueue.add(i);

        // update lastMessageId
        this.receivedDatagramQueue.push(this.lastDatagramId = id);

        // handle each capsule
        let offset = 4;
        while(offset < dataview.byteLength)
            offset = this.handleCapsule(dataview, offset);
    }
    protected handleCapsule(view: DataView, offset: number): number{
        const data = RakNetUtils.readCapsuleFrameData(view, offset);

        // Check if the capsule is fragmented
        if(data.fragment) this.handleFragment(data);
        else this.handleFrame(data);

        // return updated offset
        return data.offset;
    }
    protected handleFragment(data: FrameDescriptor): void{
        const {body, fragment} = data;

        // Can't handle frames with no fragmentation
        if(!fragment) throw new ReferenceError("This frame descriptor is not a fragment");

        // get fragment cache
        let meta = this.fragmentTable.get(fragment.id);

        // Create new fragment meta table
        if(!meta) this.fragmentTable.set(fragment.id, meta = new FragmentMeta());
        
        // Set fragment data
        meta.set(fragment.index, body);

        // Build whole buffer and remove fragment cache from table
        if(meta.length >= fragment.length){
            // remove registered meta
            this.fragmentTable.delete(fragment.id);

            // Build whole packet data and handle frame
            data.body = meta.build();

            // handle frame
            this.handleFrame(data);
        }
    }
    protected handleFrame(desc: FrameDescriptor): void{
        // First byte is Packet id
        const packetId = desc.body[0];

        // Unknown packet, maybe better to crash? I don't know
        if(!(packetId in this)) throw new SyntaxError("No handler for packet with id: 0x" + packetId.toString(16));
        this[packetId as RakNetConnectedPacketId.ConnectionRequest](desc.body);
    }
    //#endregion
    
    //#region Packet Handlers
    /* Base Handlers for connected packet */
    protected [9 /*RakNetConnectedPacketId.ConnectionRequest*/](message: Uint8Array): void{
        // Gather info
        const {time, guid} = RakNetUtils.getConnectionRequestInfo(new DataView(message.buffer, message.byteOffset));

        // Check for client guid
        if(guid !== this.guid) 
           return void console.error("Fatal security error, infected client trying to connect.");

        // rent buffer to send
        const buffer = RakNetUtils.rentConnectionRequestAcceptPacketWith(this.address, this.socket.address(), time, 0n);

        // Send
        this.enqueueData(buffer, RakNetReliability.Reliable);

        // We want fast connect so lets flush it now
        this.flush();
    }
    protected [21 /*RakNetConnectedPacketId.Disconnect*/](_: Uint8Array): void {
        this.close();
    }
    protected [0 /*RakNetConnectedPacketId.ConnectedPing*/](_: Uint8Array): void {
        const time = RakNetUtils.getConnectedPingTime(_);
        this.enqueueData(RakNetUtils.rentConnectedPongBufferWith(time, BigInt(Date.now())), RakNetReliability.Unreliable);
        this.flush();
    }
    protected [0x13 /*RakNetConnectedPacketId.NewIncomingConnection*/](message: Uint8Array): void{
        console.log("Connection Established")
    }
    protected [0xfe /*Game Data Header*/](message: Uint8Array): void {
        console.log("GameData: ", message)
    }
    //#endregion

    //#region protected
    protected close():void {
        this.server.connections.delete(this.id);
        this.flush();
    }
    protected createReadyFrameSetBuffer(): Uint8Array{ return new Uint8Array(this.maxPayloadSize); }
    protected enqueueData(data: Uint8Array, reliability: number): void{
        // Ensure proper indexing
        if(this.outgoingOrderChannels[this.outgoingChannelIndex] === undefined)
            this.outgoingSequenceChannels[this.outgoingChannelIndex] = this.outgoingOrderChannels[this.outgoingChannelIndex] = 0;

        // Base send info initialization
        const meta: FrameDescriptor = {
            body: null!,
            fragment: null!,
            orderChannel: this.outgoingChannelIndex,
            orderIndex: 0,
            reliableIndex: 0, // Change before sending each of single payloads/fragments
            sequenceIndex: 0
        }

        // Check if sequenced
        if(IS_SEQUENCED_LOOKUP[reliability]){
            meta.orderIndex = this.outgoingOrderChannels[this.outgoingChannelIndex];
            meta.sequenceIndex = this.outgoingSequenceChannels[this.outgoingChannelIndex]++;
        }

        // Check if ordered only
        if(iS_ORDERED_EXCLUSIVE_LOOKUP[reliability]) {
            meta.orderIndex = this.outgoingOrderChannels[this.outgoingChannelIndex]++;
            this.outgoingSequenceChannels[this.outgoingChannelIndex] = 0;
        }

        // Fragmented payload
        if(data.length >= (this.maxPayloadSize - MAX_FRAME_SET_HEADER_SIZE)){ 
            // payload size + 13 capsule header + 4 datagram id and datagram packet id
            
            // Max chunk size per fragment
            const chunkSize = this.maxPayloadSize - MAX_FRAME_SET_HEADER_SIZE; // 10 + fragment meta information in header

            // Number of total fragments for this payload
            const fragmentCount = Math.ceil(data.length / chunkSize);

            // Current Id of the fragment
            const id = this.nextFragmentId++;
            
            meta.fragment = {
                id,
                index: 0,
                length: fragmentCount
            };

            for(const chunk of RakNetUtils.getChunkIterator(data, chunkSize)){
                this.flushDatagramBuffer();
                
                // set
                meta.body = chunk;
                meta.reliableIndex = this.outgoingReliableIndex++;

                // send
                this.writeRawData(meta, reliability);
                
                // increment chunk id
                meta.fragment.index++;
            }


            return;
        }

        // Flush if no space is available
        if(this.datagramReadyBufferAvailableLength < (data.length + MAX_CAPSULE_HEADER_SIZE - CAPSULE_FRAGMENT_META_SIZE))
            this.flushDatagramBuffer();

        //queue capsule
        meta.reliableIndex = this.outgoingReliableIndex++;
        meta.body = data;
        this.writeRawData(meta, reliability);
    }
    protected writeRawData(descriptor: FrameDescriptor, reliability: RakNetReliability): void{
        // Crate right dataview
        const dataview = new DataView(this.datagramReadyBuffer.buffer, this.datagramReadyBuffer.byteOffset + this.datagramReadyBufferOffset);
        // Write capsule header
        this.datagramReadyBufferOffset += RakNetUtils.writeCapsulateFrameHeader(dataview, descriptor, descriptor.body.length, reliability);
        // Set body
        this.datagramReadyBuffer.set(descriptor.body, this.datagramReadyBufferOffset);
        
        // update offset
        this.datagramReadyBufferOffset += descriptor.body.length;

        // There is a less space than 1 byte for payload then send the buffer immediately  
        if(this.datagramReadyBufferAvailableLength <= (MAX_FRAME_SET_HEADER_SIZE + 1))
            this.flushDatagramBuffer();
    }
    protected flushDatagramBuffer(): void{
        // Extract current buffer
        const buffer = this.datagramReadyBuffer.subarray(0, this.datagramReadyBufferOffset);

        // Create new ready buffer 
        this.datagramReadyBuffer = this.createReadyFrameSetBuffer();
        this.datagramReadyBufferOffset = 4; //FrameSet packet Id and sequence number 1 + 3

        // Send
        this.internalSendAsFrameSet(buffer);
        console.log("Flushed");
    }
    protected internalSendAsFrameSet(buffer: Uint8Array): void {
        buffer[0] = VALID_DATAGRAM_BIT;

        // Save under the sequence id
        this.resendCache[this.outgoingFrameId] = buffer;

        RakNetUtils.writeUint24(new DataView(buffer.buffer, buffer.byteOffset), 1, this.outgoingFrameId++);
        this.sendRawData(buffer);
    }
    protected flushAcknowledges(): void {
        // Acknowledge received packets
        if(this.receivedDatagramQueue.length){
            // Rent acknowledge buffer
            const buffer = RakNetUtils.rentAcknowledgePacketWith(
                RakNetUnconnectedPacketId.AckDatagram, 
                RakNetConnection.getRangesFromSequence(this.receivedDatagramQueue.values())
            );
            //Send
            this.sendRawData(buffer);
            // Clear the array
            this.receivedDatagramQueue.length = 0;
        }

        // Acknowledge packet that missing
        if(this.missingDatagramQueue.size){
            // Rent acknowledge buffer
            const buffer = RakNetUtils.rentAcknowledgePacketWith(
                RakNetUnconnectedPacketId.NackDatagram, 
                RakNetConnection.getRangesFromSequence(this.missingDatagramQueue.values())
            );

            this.sendRawData(buffer);
            // Clear the set
            this.missingDatagramQueue.clear();
        }
    }
    //#endregion



    //#region Public APIs
    public disconnect(): void {
        // Send close packet!
        //TODO: Send Disconnect packet

        // Close this connection
        this.close();
    }
    //#endregion


    public flush(): void{
        this.flushAcknowledges();

        if(this.datagramReadyBufferOffset > 4) this.flushDatagramBuffer();
    }
    protected sendRawData(data: Uint8Array): void{
        this.socket.send(data, this.port, this.internetProtocolAddress);
    }

    //#region Static
    // create new instance
    public static create(server: RakNetServer, socket: Socket, mtu: number, guid: bigint, address: AddressInfo): RakNetConnection{
        return new RakNetConnection(server, socket, mtu, guid, address);
    }
    protected static * getRangesFromSequence(sequence: Iterator<number>): Generator<{min: number, max: number}, number> {
        let v = sequence.next();
        if(v.done) return 0;

        // min for range
        let min = v.value, max = min;
        let i = 1;
        do {
            v = sequence.next();
            const current = v.value;
            const dif = current - min;
            if(dif === 1) max = current;
            else if (dif > 1) {
                yield {min, max};
                i++;
                min = max = current;
            }
        }
        while(!v.done);
        yield {min, max}
        return i;
    }
    //#endregion
}

export var internalHandleIncoming: (connection: RakNetConnection, msg: Uint8Array)=>void;
