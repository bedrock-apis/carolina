import {createSocket, type Socket, type SocketType} from "node:dgram";
import { RakNetUnconnectedPacketId } from "../enums";
import type { AddressInfo } from "node:net";
import { RakNetUtils } from "../proto";
import { internalHandleIncoming, RakNetConnection } from "./connection";
import { Encoding } from "@carolina/encoding";
import { MAX_MTU_SIZE, UDP_HEADER_SIZE } from "../constants";

export class RakNetServer {
    /**
     * create new source with binding enabled for specified port and address
     * @param socketType 
     * @param address 
     * @param port 
     * @returns 
     */
    public static async createSource(socketType: SocketType, address: string, port: number): Promise<Socket>{
        // create raw socket
        const socket = createSocket(socketType);

        // function pointer for error rejection resolver
        let rer: (...params: any[])=>void;
        
        // Create promise and wait until socket is properly bind
        await new Promise<void>((res,rej)=>{
            socket.once("error", rer=rej);
            socket.bind(port, address, res);
        }).catch(()=>socket.close(()=>void 0));

        // free the error rejection as binding was successful
        socket.off("error", rer!);

        // return socket
        return socket;
    }
    
    public constructor(){}
    public readonly connections: Map<string, RakNetConnection> = new Map();
    
    // Random GUID for this server instance
    public readonly guid: bigint = RakNetUtils.random64() & 0x7fff_ffff_ffff_ffffn;
    
    // Sources
    protected readonly sources: Set<Socket> = new Set<Socket>();

    public addSource(socket: Socket): void{
        this.sources.add(socket);
        socket.on("message", (msg, rinfo)=>this.onMessage(socket, msg as unknown as Uint8Array, rinfo));
    }

    // base message handler
    protected onMessage(socket: Socket, msg: Uint8Array, endpoint: AddressInfo): void
    {
        // Get source provider
        if(!this.sources.has(socket)){
            console.error("No source available, message from unknown source . . .");
            return;
        }
        
        // get raknet packet id
        const packedId = msg[0];

        // Is Online Packet
        if((packedId & 0x80))
        {
            //Build id from the endpoint
            const id = RakNetUtils.getFullAddressFor(endpoint);

            //Connection instance
            const connection = this.connections.get(id);

            // Ignore any packets from unknown client
            if(!connection) return void RakNetUtils.debug("Received online packet from unknown client:", id);

            internalHandleIncoming(connection, msg);

            return;
        }

        // Check for handler availability
        if(!(packedId in this)) 
            return void console.error("No handler for such a packet: " + packedId);

        // Handle packet
        this[packedId as 1](socket, msg, endpoint);
    }

    // Header for open connection requested two
    protected [RakNetUnconnectedPacketId.OpenConnectionRequestTwo](socket: Socket, data: Uint8Array, receiver: AddressInfo): void{
        const {guid, mtu} = RakNetUtils.getDataFromOpenConnectionRequestTwo(data);

        // Rent buffer for reply with specified properties
        const buffer = RakNetUtils.rentOpenConnectionReplyTwoBufferWith(
            this.guid,
            receiver,
            mtu
        );

        // Send rented buffer
        socket.send(buffer, receiver.port, receiver.address);
        const id = RakNetUtils.getFullAddressFor(receiver);

        // Create new connection
        this.connections.set(id, RakNetConnection.create(this, socket, mtu, guid, receiver));

        console.log("New Connection created");
    }

    // Header for open connection requested one
    protected [RakNetUnconnectedPacketId.OpenConnectionRequestOne](socket: Socket, data: Uint8Array, receiver: AddressInfo): void{
        let MTU = data.length + UDP_HEADER_SIZE;

        // Rent buffer for reply with specified properties
        const buffer = RakNetUtils.rentOpenConnectionReplyOneBufferWith(
            this.guid,
            // Official raknet source /Source/RakPeer.cpp:5186
            MTU > MAX_MTU_SIZE ? MAX_MTU_SIZE : MTU
        );

        // Send rented buffer
        socket.send(buffer, receiver.port, receiver.address);
    }

    // Handler for unconnected ping
    protected [RakNetUnconnectedPacketId.UnconnectedPing](socket: Socket, data: Uint8Array, receiver: AddressInfo): void{
        const pingTime = RakNetUtils.getUnconnectedPingTime(data);

        // Rent buffer for pong with specified properties
        const buffer = RakNetUtils.rentUnconnectedPongBufferWith(
            pingTime,
            this.guid,

            // Needs to be improved later on
            Encoding.utf8.encode(`MCPE;Carolina;390;1.14.60;15;10;${this.guid};Bedrock Level;creative;1;19132;19133;`)/* new Uint8Array()*/);
        
        // Send rented buffer
        socket.send(buffer, receiver.port, receiver.address);
    }
}