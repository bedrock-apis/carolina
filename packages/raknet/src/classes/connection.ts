import type { Socket } from "node:dgram";
import type { AddressInfo } from "node:net";
import { ONLINE_DATAGRAM_BIT_MASK, UDP_HEADER_SIZE, VALID_DATAGRAM_BIT } from "../constants";
import { RakNetUtils } from "../proto";
import { FrameDescriptor } from "../interfaces";
import { FragmentMeta } from "./fragment-meta";
import { RakNetConnectedPacketId, RakNetUnconnectedPacketId } from "../enums";
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

    protected orderChannels: Record<number, number> = Object.create(null);
    protected orderChannelIndex: number = 0;
    protected outgoingSequenceIndex: number = 0;
    protected outgoingReliableIndex: number = 0;
    protected outgoingFrameId: number = 0;

    protected datagramReadyBuffer: Uint8Array;
    protected datagramReadyBufferOffset = 0;
    protected resendCache: Record<number, Uint8Array> = Object.create(null);
    protected readonly maxPayloadSize: number;
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

        console.log("Handle ack/nack packet");
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
        while(offset < dataview.byteLength) offset = this.handleCapsule(dataview, offset);
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
        if(!(packetId in this))
            return void console.error("No handler for packet with id: 0x" + packetId.toString(16));

        console.log(desc);

        this[packetId as RakNetConnectedPacketId.ConnectionRequest](desc.body);
    }
    //#endregion
    
    //#region Packet Handlers
    /* Base Handlers for connected packet */
    protected [RakNetConnectedPacketId.ConnectionRequest](message: Uint8Array): void{
        // Gather info
        const {time, guid} = RakNetUtils.getConnectionRequestInfo(new DataView(message.buffer, message.byteOffset));

        // Check for client guid
        if(guid !== this.guid) 
           return void console.error("Fatal security error, infected client trying to connect.");

        // rent buffer to send
        const buffer = RakNetUtils.rentConnectionRequestAcceptPacketWith(this.address, this.socket.address(), time, 0n);

        // Send
        this.enqueueData(buffer);

        // We want fast connect so lets flush it now
        this.flush();
    }
    protected [RakNetConnectedPacketId.Disconnect](_: Uint8Array): void { this.close(); }
    //#endregion

    //#region protected
    protected close():void {
        this.server.connections.delete(this.id);
        this.flush();
    }
    protected createReadyFrameSetBuffer(): Uint8Array{
        const buffer = new Uint8Array(this.maxPayloadSize);
        buffer[0] = VALID_DATAGRAM_BIT;
        RakNetUtils.writeUint24(new DataView(buffer.buffer), 1, this.outgoingFrameId);
        return buffer;
    }
    protected enqueueData(_data: Uint8Array): void{
    
        // Base send info
        const info: FrameDescriptor = {
            body: null!,
            fragment: null!,
            orderChannel: this.orderChannelIndex,
            orderIndex: (this.orderChannels[this.orderChannelIndex]??=0)++,
            reliableIndex: 0, // Change before sending each of single payloads/fragments
            sequenceIndex: 0
        }


        // Fragmented payload
        if(_data.length <= (this.maxPayloadSize - 4 - 13)){ 
            // payload size + 13 capsule header + 4 datagram id and datagram packet id
            
            // Max chunk size per fragment
            const chunkSize = this.maxPayloadSize - (4 + 13 + 10);

            // Number of total fragments for this payload
            const fragmentCount = Math.ceil(_data.length / chunkSize);

            // Current Id of the fragment
            const id = this.nextFragmentId++;
            
            // Base send info
            const info: FrameDescriptor = {
                body: null!,
                fragment: {length: fragmentCount, id, index: 0},
                orderChannel: this.orderChannelIndex,
                orderIndex: (this.orderChannels[this.orderChannelIndex]??=0)++,
                reliableIndex: 0,
                sequenceIndex: 0
            }
            for(const chunk of RakNetUtils.getChunkIterator(_data, chunkSize)){
                this.flushDatagramBuffer();
                
                // update chunk
                info.body = chunk;

                // Send
                this.writeRawData(info);

                // Increment
                info.fragment!.index++;

            }

        }



        let offset = this.datagramReadyBufferOffset; // Capsule metadata no fragment

        if(_data.length > (this.datagramReadyBuffer.length - (offset + 13)))
        //4+3+3+2+1
        console.log("Data enqueued: " + _data.length);
    }
    protected writeRawData(descriptor: FrameDescriptor): void{
        

    }
    protected flushDatagramBuffer(): void{
        // Extract current buffer
        const buffer = this.datagramReadyBuffer.subarray(0, this.datagramReadyBufferOffset);

        // Save under the sequence id
        this.resendCache[this.outgoingFrameId++] = buffer;

        // Create new ready buffer 
        this.datagramReadyBuffer = this.createReadyFrameSetBuffer();
        this.datagramReadyBufferOffset = 4; //FrameSet packet Id and sequence number 1 + 3

        // Sended
        console.log("Sended: " + buffer.length);
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

            console.log("Nack");
            this.sendRawData(buffer);
            // Clear the set
            this.missingDatagramQueue.clear();
        }

        console.log("This flush acknowledges");
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

        console.log("Flushed");
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
