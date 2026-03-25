import { ConnectionEndpoint, NetworkConnection, NetworkServer } from '../../../api/interface';
import { IDEAL_MAX_MTU_SIZE, random64, UDP_HEADER_SIZE } from '../../constants';
import {
   getDataViewFromBuffer,
   getUnconnectedPingTime,
   readOpenConnectionRequestTwoInfo,
   rentOpenConnectionReplyOneBufferWith,
   rentOpenConnectionReplyTwoBufferWith,
   rentUnconnectedPongBufferWith,
} from '../../proto';
import { EndpointHandle } from '../endpoint';
import { RakNetNetworkConnection } from '../network-connection/base';
import { RakNetNetworkServerConnection } from './network-server-connection';

const HARDCODED_MOTD = new TextEncoder().encode(`MCPE;Carolina;999;2.0.0;0;50;0;The New World;`);
export class RakNetNetworkServer implements NetworkServer {
   public onError: NetworkServer['onError'] = null;
   public onLog: NetworkServer['onLog'] = null;
   public static STALE_CONNECTION_TIMEOUT: number = 14_000;
   public constructor() {
      setInterval(() => {
         const time = performance.now();
         for (const connection of this.connections.values())
            if (time - connection.incomingLastActivity > new.target.STALE_CONNECTION_TIMEOUT) {
               try {
                  this.onLog?.(`Stale connection from ${connection.uniqueId} . . .`);
                  this.disconnect(connection);
               } catch {}
            }
      }, 5_000)?.unref?.();
   }
   public readonly guid: bigint = random64();
   public readonly connections: Map<string, RakNetNetworkServerConnection> = new Map();
   public onConnectionConnected: NetworkServer['onConnectionConnected'] = null;
   public onConnectionDisconnected: NetworkServer['onConnectionDisconnected'] = null;
   public onConnectionMessaged: NetworkServer['onConnectionMessaged'] = null;
   public onMOTDRequested: (() => Uint8Array) | null = null;
   public blackList: Set<string> | null = null;
   public setAddressBlackList(list: Set<string> | null): void {
      this.blackList = list;
   }
   public getAddressBlackList(): Set<string> | null {
      return this.blackList;
   }
   public dispose(): void {
      for (const connection of this.connections.values()) {
         this.disconnect(connection);
      }
   }
   public disconnect(connection: NetworkConnection): void {
      (connection as RakNetNetworkServerConnection).disconnect();
      (connection as RakNetNetworkServerConnection).dispose();
   }
   public send(connection: NetworkConnection, message: Uint8Array): void {
      (connection as RakNetNetworkServerConnection).send(message);
   }
   public getAllConnections(): Iterable<NetworkConnection> {
      return this.connections.values();
   }
   public getConnectionById(id: string): NetworkConnection | null {
      return this.connections.get(id) ?? null;
   }
   public getCurrentCapacity(): number {
      return this.connections.size;
   }
   /**
    * Virtualized in way, it accepts any messages even virtual messages, and more
    */
   public process(handle: EndpointHandle, endpoint: ConnectionEndpoint, message: Uint8Array): void {
      // get raknet packet id
      const packedId = message[0];

      // Is Online Packet
      if (packedId & 0x80) {
         // Ignore any packets from unknown client
         //Build id from the endpoint
         const id = RakNetNetworkConnection.getUniqueIdFromEndpoint(endpoint);
         //Connection instance
         const connection = this.connections.get(id);

         if (!connection) return void this.onLog?.('Received online packet from unknown connection: ' + id);

         return void connection.process(message);
      }

      // We do this check after to minimize running code for every packet.
      // And if they are not joined then then we do this check on them.
      if (this.blackList?.has(endpoint.address)) return;

      if (!(packedId in this))
         return void this.onLog?.("Received offline message we don't have handler for: " + packedId);

      this[packedId as 1](handle, endpoint, message);
   }

   // Handler for unconnected ping
   protected 1(handle: EndpointHandle, endpoint: ConnectionEndpoint, message: Uint8Array): void {
      const view = getDataViewFromBuffer(message);
      const pingTime = getUnconnectedPingTime(view);

      // Rent buffer for pong with specified properties
      const buffer = rentUnconnectedPongBufferWith(
         pingTime,
         this.guid,
         this.onMOTDRequested?.() ?? HARDCODED_MOTD
      );

      // Send rented buffer
      handle.send(buffer, endpoint);
   }
   // Header for open connection requested one
   protected 5(handle: EndpointHandle, endpoint: ConnectionEndpoint, message: Uint8Array): void {
      const MTU = message.length + UDP_HEADER_SIZE;

      // Rent buffer for reply with specified properties
      const buffer = rentOpenConnectionReplyOneBufferWith(
         this.guid,
         // Official raknet source /Source/RakPeer.cpp:5186
         MTU > IDEAL_MAX_MTU_SIZE ? IDEAL_MAX_MTU_SIZE : MTU
      );

      // Send rented buffer
      handle.send(buffer, endpoint);
   }

   // Header for open connection requested two

   protected 7(handle: EndpointHandle, endpoint: ConnectionEndpoint, message: Uint8Array): void {
      const view = getDataViewFromBuffer(message);
      const { guid, mtu, serverAddress } = readOpenConnectionRequestTwoInfo(view);

      // Rent buffer for reply with specified properties
      const buffer = rentOpenConnectionReplyTwoBufferWith(this.guid, endpoint, mtu);

      // Send rented buffer
      handle.send(buffer, endpoint);
      const id = RakNetNetworkConnection.getUniqueIdFromEndpoint(endpoint);
      if (this.connections.has(id))
         return void this.onLog?.(`Duplicate connection with this endpoint: ${id} is already connected.`);

      const connection = new RakNetNetworkServerConnection(this, handle, endpoint, guid, serverAddress); // RakNetConnection.create(this, source, mtu, guid, receiver);
      this.connections.set(id, connection);
      connection.mtu = mtu;
   }
}
