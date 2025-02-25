import { Socket } from "node:dgram";
import type { AddressInfo } from "node:net";
import { ONLINE_DATAGRAM_BIT_MASK, VALID_DATAGRAM_BIT } from "../constants";
import { RakNetUtils } from "../proto";
import { FrameDescriptor } from "../interfaces";
import { FragmentMeta } from "./fragment-meta";

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
    protected constructor(
        protected readonly socket: Socket,
        protected readonly mtu: number,
        public readonly guid: bigint,
        address: AddressInfo
    ){
        this.id = RakNetUtils.getFullAddressFor(address);
        this.internetProtocolAddress = address.address;
        this.internetProtocolVersion = address.family === "IPv4"?4:6;
        this.port = address.port;
    }
    /**
     * Base handler for raw incoming packets, internal usage!
     * @param msg buffer
     * @returns void
     */
    protected handleIncoming(msg: Uint8Array): void{
        const mask = msg[0] & ONLINE_DATAGRAM_BIT_MASK;
        if(mask === VALID_DATAGRAM_BIT) return void this.handleFrameSet(msg);

        __debug__: console.log("Handle ack/nack packet");
    }
    protected handleFrameSet(msg: Uint8Array): void{
        const dataview = new DataView(msg.buffer, msg.byteOffset, msg.byteLength);
        const id = RakNetUtils.readUint24(dataview, 1);
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
    protected handleFrame(desc: FrameDescriptor): void{}
    // create new instance
    public static create(socket: Socket, mtu: number, guid: bigint, address: AddressInfo): RakNetConnection{return new RakNetConnection(socket, mtu, guid, address);}
}

export var internalHandleIncoming: (connection: RakNetConnection, msg: Uint8Array)=>void;
