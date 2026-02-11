import { ConnectionEndpoint } from '@carolina/net';
import { EndpointHandle, RakNetNetworkServer } from '@carolina/net/raknet';
import { createSocket, Socket } from 'node:dgram';

import { NetworkDriver } from '../driver';
import { SyncNetworkDriver } from '../sync-driver';
import { NetworkEngine } from './network-engine';

export class UDPEndpointHandle implements EndpointHandle {
   public static async create(
      port = 19132,
      ipAddress?: string,
      useIPv6?: boolean
   ): Promise<UDPEndpointHandle> {
      const ipv6 = useIPv6 ?? ipAddress?.includes('') ?? false;
      const socket = createSocket({ type: ipv6 ? 'udp6' : 'udp4' });
      await new Promise<void>(res => socket.bind(port, ipAddress, res));
      return new UDPEndpointHandle(socket);
   }
   public readonly socket: Socket;
   protected constructor(socket: Socket) {
      this.socket = socket;
   }
   public send(message: Uint8Array, endpoint: ConnectionEndpoint): void {
      this.socket.send(message, endpoint.port, endpoint.address);
   }
   public with(network: NetworkDriver): void {
      if (network instanceof SyncNetworkDriver) {
         return this.redirect(network.engine);
      }
      throw new TypeError(
         'You can no apply handle to this kind of network driver: ' + network.constructor?.name
      );
   }
   public redirect(network: NetworkEngine): void {
      if (network.server instanceof RakNetNetworkServer) {
         const s = network.server;
         this.socket.on('message', (message, rinfo) => {
            s.process(this, { address: rinfo.address, port: rinfo.port }, message);
         });
         return;
      }
      throw new TypeError(
         'You can no apply handle to this kind of network server: ' + network.server.constructor?.name
      );
   }
}
