import { ServerConnection, SocketSource } from '@carolina/raknet';
import { type Carolina } from '../carolina';
import { RakNetListener } from './raknet-listener';
import { NetworkConnection } from './connection';
import { ResizableCursor } from '@carolina/binary';

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
}
