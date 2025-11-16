import { ServerConnection, SocketSource } from '@carolina/raknet';
import { type Carolina } from '../carolina';
import { RakNetListener } from './raknet-listener';
import { NetworkConnection } from './connection';
import { ResizableCursor } from '@carolina/binary';
import { createSocket } from 'node:dgram';
import {
   NETWORK_ANY_ADDRESS4,
   NETWORK_ANY_ADDRESS6,
   NETWORK_LAN_DISCOVERY_PORT4,
   NETWORK_LAN_DISCOVERY_PORT6,
} from '../constants';

export class NetworkServer {
   protected readonly raknet: RakNetListener;
   // All buffers should be able to fit in here
   public readonly singlePacketCursorHelper = new ResizableCursor(256, 1 << 14);
   // All buffers should be able to fit in here
   public readonly multiPacketCursorHelper = new ResizableCursor(256, 1 << 16);
   public readonly rawConnections = new Map<ServerConnection, NetworkConnection>();
   public constructor(public readonly carolina: Carolina) {
      this.raknet = new RakNetListener(carolina);
      this.raknet.onNewConnection = (connection): void => void this.onConnectionCreate(connection);
      this.raknet.onErrorHandler = console.error.bind(null, '[CarolinaServer][ERROR]');
      this.raknet.onConnectionDisconnected = (connection): void => this.onConnectionDiscard(connection);
   }
   public onConnectionDiscard(raknet: ServerConnection): void {
      this.rawConnections.delete(raknet);
   }
   public onConnectionCreate(connection: ServerConnection): NetworkConnection {
      const cc = new NetworkConnection(this, connection);
      this.rawConnections.set(connection, cc);
      return cc;
   }
   public onConnectionReady(connection: NetworkConnection): void {}
   public addListenerSource(source: SocketSource): void {
      this.raknet.addListenerSource(source);
   }
   public async bindV4(
      port: number = NETWORK_LAN_DISCOVERY_PORT4,
      ipaddress: string = NETWORK_ANY_ADDRESS4,
   ): Promise<void> {
      const source = await createSource('udp4', port, ipaddress);
      this.addListenerSource(source);
   }
   public async bindV6(
      port: number = NETWORK_LAN_DISCOVERY_PORT6,
      ipaddress: string = NETWORK_ANY_ADDRESS6,
   ): Promise<void> {
      const source = await createSource('udp6', port, ipaddress);
      this.addListenerSource(source);
   }
}

async function createSource(kind: 'udp4' | 'udp6', port: number, ipaddress?: string): Promise<SocketSource> {
   const family = kind === 'udp4' ? 'IPv4' : 'IPv6';
   const socket = createSocket(kind);
   const { promise, reject, resolve } = Promise.withResolvers();
   if (ipaddress) socket.bind(port, ipaddress, resolve);
   else socket.bind(port, resolve);
   socket.once('error', reject);
   await promise;
   socket.off('error', reject);
   return {
      onDataCallback: _ => socket.on('message', (buffer, { address, port }) => _(buffer, { address, family, port })),
      send: async (data, endpoint) => void socket.send(data, endpoint.port, endpoint.address),
   };
   /*
   const socket = await Bun.udpSocket({
      binaryType: 'uint8array',
      hostname: '0.0.0.0',
      port: 19132,
      socket: {
         data: (_, msg, port, address) => fn?.(msg, { port, address, family: 'IPv4' }),
      },
   });
   let fn: null | ((uint8Array: Uint8Array, address: AddressInfo) => void) = null;
   return {
      onDataCallback: _ => (fn = _),
      send: async (buffer, endpoint) => void socket.send(buffer, endpoint.port, endpoint.address),
   };*/
}
