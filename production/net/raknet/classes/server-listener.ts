import type { Connection, ServerListener } from '../../api/interface';

import { IDEAL_MAX_MTU_SIZE, random64, UDP_HEADER_SIZE } from '../constants';
import { AddressInfo, SocketSource } from '../interfaces';
import { getUnconnectedPingTime, rentUnconnectedPongBufferWith } from '../proto';
import { getOpenConnectionRequestTwoInfo } from '../proto/connection-request';
import { rentOpenConnectionReplyOneBufferWith } from '../proto/open-connection-reply-one';
import { rentOpenConnectionReplyTwoBufferWith } from '../proto/open-connection-reply-two';
import { getDataViewFromBuffer } from '../proto/uint24';
import { BaseConnection } from './base-connection';
import { ServerConnection } from './server-connection';
export class ServerConnectionListener implements ServerListener {
   public static STALE_CONNECTION_ELIMINATION_INTERVAL = 3_000;
   public static STALE_CONNECTION_LIFETIME_MAX_AGE = 15_000;
   public constructor() {
      setInterval(() => {
         const now = performance.now();
         for (const connection of this.connections.values())
            if (now - connection.incomingLastActivity > 4_000) {
               connection.disconnect();
               connection.onDisconnect?.();
            }
      }, 2_000).unref();
   }
   public readonly discoveryEnabled?: boolean;
   public onErrorHandler?: (error: Error) => void;
   public onNewConnection?: (connection: Connection) => void;
   public onConnectionDisconnected?: (connection: Connection) => void;
   public readonly connections: Map<string, ServerConnection> = new Map();
   // Random GUID for this server instance
   public readonly guid: bigint = random64();

   // base message handler
   protected onMessage(source: SocketSource, msg: Uint8Array, endpoint: AddressInfo): void {
      // get raknet packet id
      const packedId = msg[0];
      // Is Online Packet
      if (packedId & 0x80) {
         // Ignore any packets from unknown client
         //Build id from the endpoint
         const id = BaseConnection.getIdentifierFor(endpoint);
         //Connection instance
         const connection = this.connections.get(id);
         /*
         
         if (!connection)
            return void this.onErrorHandler?.(new ReferenceError('Got online packet from not registered connection'));*/

         return void connection?.handleIncoming(msg);
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
      receiver: AddressInfo
   ): void {
      const view = getDataViewFromBuffer(data);
      const { guid, mtu, serverAddress } = getOpenConnectionRequestTwoInfo(view);

      // Rent buffer for reply with specified properties
      const buffer = rentOpenConnectionReplyTwoBufferWith(this.guid, receiver, mtu);

      // Send rented buffer
      source.send(buffer, receiver);
      const id = BaseConnection.getIdentifierFor(receiver);
      if (this.connections.has(id)) return;

      const connection = new ServerConnection(source, receiver, serverAddress, guid, mtu); // RakNetConnection.create(this, source, mtu, guid, receiver);
      connection.onConnectionEstablishedHandle = (): void => void this.onNewConnection?.(connection);
      connection.onErrorHandle = (_): void => this.onErrorHandler?.(_);
      connection.onDisconnect = (): void => {
         this.connections.delete(id);
         this.onConnectionDisconnected?.(connection);
      };
      // Create new connection
      this.connections.set(id, connection);
   }

   // Header for open connection requested one
   protected [5 /*RakNetUnconnectedPacketId.OpenConnectionRequestOne*/](
      socket: SocketSource,
      data: Uint8Array,
      receiver: AddressInfo
   ): void {
      let MTU = data.length + UDP_HEADER_SIZE;

      // Rent buffer for reply with specified properties
      const buffer = rentOpenConnectionReplyOneBufferWith(
         this.guid,
         // Official raknet source /Source/RakPeer.cpp:5186
         MTU > IDEAL_MAX_MTU_SIZE ? IDEAL_MAX_MTU_SIZE : MTU
      );

      // Send rented buffer
      socket.send(buffer, receiver);
   }

   // Handler for unconnected ping
   protected [1 /*RakNetUnconnectedPacketId.UnconnectedPing*/](
      socket: SocketSource,
      data: Uint8Array,
      receiver: AddressInfo
   ): void {
      const view = getDataViewFromBuffer(data);
      const pingTime = getUnconnectedPingTime(view);

      // Rent buffer for pong with specified properties
      const buffer = rentUnconnectedPongBufferWith(
         pingTime,
         this.guid,
         this.onGetMOTD?.(receiver) ??
            new TextEncoder().encode(`MCPE;Carolina;390;1.14.60;16;50;${this.guid};The New World;`)
      );
      // Send rented buffer
      socket.send(buffer, receiver);
   }
   public onGetMOTD?: (receiver: AddressInfo) => Uint8Array;

   public addListenerSource(source: SocketSource): void {
      source.onDataCallback((msg, rinfo) => this.onMessage(source, msg, rinfo));
   }
}

export interface InternalConnectionCandidate {
   lastActivityTime: number;
   mtu: number;
   endpoint: AddressInfo;
}
