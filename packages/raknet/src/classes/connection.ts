import { Socket } from "node:dgram";
import type { AddressInfo } from "node:net";
import { ONLINE_DATAGRAM_BIT_MASK, UDP_HEADER_SIZE, VALID_DATAGRAM_BIT } from "../constants";
import { RakNetUtils } from "../proto";
import { FrameDescriptor } from "../interfaces";
import { FragmentMeta } from "./fragment-meta";
import { RakNetUnconnectedPacketId } from "../enums";

export class RakNetConnection {
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
    protected missingDatagramQueue: Set<number>; // Requires fast access and removal specific value without knowing its [index].
    protected receivedDatagramQueue: Array<number>; // used a lot, use Array for performance benefits
    protected receivedDatagram: Record<number, boolean> = Object.create(null);
    protected readonly maxPayloadSize: number;
    protected constructor(
        protected readonly socket: Socket,
        mtu: number,
        public readonly guid: bigint,
        address: AddressInfo
    ){
        this.id = RakNetUtils.getFullAddressFor(address);
        this.internetProtocolAddress = address.address;
        this.internetProtocolVersion = address.family === "IPv4"?4:6;
        this.port = address.port;
        this.maxPayloadSize = mtu - UDP_HEADER_SIZE;

        this.missingDatagramQueue = new Set();
        this.receivedDatagramQueue = [];
    }
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
        const data = RakNetUtils.readFrameData(view, offset);

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
        console.log("Handle frame:", desc.body[0].toString(16));
        this.flush();
    }
    public flush(): void{

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

        console.log("Flushed");

    }
    public enqueueData(_data: Uint8Array): void{

    }



    protected sendRawData(data: Uint8Array): void{
        this.socket.send(data, this.port, this.internetProtocolAddress);
    }

    // create new instance
    public static create(socket: Socket, mtu: number, guid: bigint, address: AddressInfo): RakNetConnection{
        return new RakNetConnection(socket, mtu, guid, address);
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
}

export var internalHandleIncoming: (connection: RakNetConnection, msg: Uint8Array)=>void;
