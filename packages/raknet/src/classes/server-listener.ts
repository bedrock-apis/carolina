import { ServerConnection } from './server-connection';
import { MAX_MTU_SIZE, random64, UDP_HEADER_SIZE } from '../constants';
import { AddressInfo, SocketSource } from '../interfaces';
import { BaseConnection } from './base-connection';
import { getUnconnectedPingTime, rentUnconnectedPongBufferWith } from '../proto';
import { getDataViewFromBuffer } from '../proto/uint24';
import { rentOpenConnectionReplyOneBufferWith } from '../proto/open-connection-reply-one';
import { getOpenConnectionRequestTwoInfo } from '../proto/connection-request';
import { rentOpenConnectionReplyTwoBufferWith } from '../proto/open-connection-reply-two';

export class ServerConnectionListener {
   public onErrorHandler?: (error: Error) => void;
   public onNewConnection?: (connection: ServerConnection) => void;
   public readonly connections: Map<string, ServerConnection> = new Map();

   // Random GUID for this server instance
   public readonly guid: bigint = random64();

   // base message handler
   protected onMessage(source: SocketSource, msg: Uint8Array, endpoint: AddressInfo): void {
      // get raknet packet id
      const packedId = msg[0];
      // Is Online Packet
      if (packedId & 0x80) {
         //Build id from the endpoint
         const id = BaseConnection.getIdentifierFor(endpoint);

         //Connection instance
         const connection = this.connections.get(id);

         // Ignore any packets from unknown client
         if (!connection)
            return void this.onErrorHandler?.(new ReferenceError('Got online packet from not registered connection'));

         return void connection.handleIncoming(msg);
      }

      // Check for handler availability
      if (!(packedId in this)) return void console.error('No handler for such a packet: ' + packedId);

      // Handle packet
      this[packedId as 1](source, msg, endpoint);
   }

   // Header for open connection requested two
   protected [7 /*RakNetUnconnectedPacketId.OpenConnectionRequestTwo*/](
      source: SocketSource,
      data: Uint8Array,
      receiver: AddressInfo,
   ): void {
      const view = getDataViewFromBuffer(data);
      const { guid, mtu, serverAddress } = getOpenConnectionRequestTwoInfo(view);

      // Rent buffer for reply with specified properties
      const buffer = rentOpenConnectionReplyTwoBufferWith(this.guid, receiver, mtu);

      // Send rented buffer
      source.send(buffer, receiver);
      const id = BaseConnection.getIdentifierFor(receiver);

      const connection = new ServerConnection(source, receiver, serverAddress, mtu, guid); // RakNetConnection.create(this, source, mtu, guid, receiver);

      // Create new connection
      this.connections.set(id, connection);

      this.onNewConnection?.(connection);
   }

   // Header for open connection requested one
   protected [5 /*RakNetUnconnectedPacketId.OpenConnectionRequestOne*/](
      socket: SocketSource,
      data: Uint8Array,
      receiver: AddressInfo,
   ): void {
      let MTU = data.length + UDP_HEADER_SIZE;

      // Rent buffer for reply with specified properties
      const buffer = rentOpenConnectionReplyOneBufferWith(
         this.guid,
         // Official raknet source /Source/RakPeer.cpp:5186
         MTU > MAX_MTU_SIZE ? MAX_MTU_SIZE : MTU,
      );

      // Send rented buffer
      socket.send(buffer, receiver);
   }

   // Handler for unconnected ping
   protected [1 /*RakNetUnconnectedPacketId.UnconnectedPing*/](
      socket: SocketSource,
      data: Uint8Array,
      receiver: AddressInfo,
   ): void {
      const view = getDataViewFromBuffer(data);
      const pingTime = getUnconnectedPingTime(view);

      // Rent buffer for pong with specified properties
      const buffer = rentUnconnectedPongBufferWith(pingTime, this.guid, this.getMOTD());
      // Send rented buffer
      socket.send(buffer, receiver);
   }

   /** This method is mean to be overridden, thats why its unoptimized anyway */
   public getMOTD(): Uint8Array {
      return new TextEncoder().encode(
         `MCPE;Carolina;390;1.14.60;15;10;${this.guid};Bedrock Level;creative;1;19132;19133;`,
      );
   }

   public addListenerSource(source: SocketSource): void {
      source.onDataCallback((msg, rinfo) => this.onMessage(source, msg, rinfo));
   }
}

export interface InternalConnectionCandidate {
   lastActivityTime: number;
   mtu: number;
   endpoint: AddressInfo;
}
