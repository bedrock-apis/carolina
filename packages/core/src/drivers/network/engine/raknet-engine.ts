import { Cursor } from '@carolina/binary';
import { RakNetNetworkServer, SocketSource } from '@carolina/net/raknet';
import { createSocket } from 'node:dgram';

import { DiscoveryOptions } from '../driver';
import { NetworkEngine } from './network-engine';

const encoder = new TextEncoder();
export class RaknetNetworkEngine extends NetworkEngine<RakNetNetworkServer> {
   public motdCache: Uint8Array;
   public constructor() {
      super(new RakNetNetworkServer());
      this.motdCache = RaknetNetworkEngine.toMotdCache(
         `MCPE;Carolina;975;1.26.10;0;50;${this.server.guid};AQUALIDERIUM - THE NEVER END`
      );
      this.server.onMOTDRequested = (): Uint8Array => this.motdCache;
   }
   public setMotd(motd: DiscoveryOptions): void {
      this.motdCache = RaknetNetworkEngine.toMotdCache(
         `${['MCPE', motd.provider, motd.protocol, motd.version, motd.onlinePlayers, motd.maxPlayers, this.server.guid, motd.level, motd.gameMode, Number(motd.discoverable)].join(';')};`
      );
   }
   public static toMotdCache(motd: string): Uint8Array {
      return encoder.encode(motd);
   }
   public override getWriteCursor(size: number): Cursor {
      const cursor = Cursor.create(new Uint8Array(size + 1));
      // Raknet game packet id
      cursor.writeUint8(0xfe);
      return cursor;
   }
}

export async function createSource(
   kind: 'udp4' | 'udp6',
   port: number,
   ipaddress?: string
): Promise<SocketSource> {
   const family = kind === 'udp4' ? 'IPv4' : 'IPv6';
   const socket = createSocket(kind);
   const { promise, reject, resolve } = Promise.withResolvers();
   if (ipaddress) socket.bind(port, ipaddress, resolve);
   else socket.bind(port, resolve);
   socket.once('error', reject);
   await promise;
   socket.off('error', reject);
   return {
      onDataCallback: _ => {
         socket.on('message', (buffer, { address, port }) => _(buffer, { address, family, port }));
      },
      send: async (data, endpoint) => {
         void socket.send(data, endpoint.port, endpoint.address);
      },
   } satisfies SocketSource;
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
