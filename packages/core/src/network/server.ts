import { ServerConnection, SocketSource } from '@carolina/raknet';
import { type Carolina } from '../carolina';
import { RakNetListener } from './raknet-listener';
import { CarolinaConnection } from './connection';
import { ResizableCursor } from '@carolina/binary';

export class CarolinaServer {
   // All buffers should be able to fit in here
   public readonly singlePacketCursorHelper = new ResizableCursor(256, 1 << 14);
   // All buffers should be able to fit in here
   public readonly multiPacketCursorHelper = new ResizableCursor(256, 1 << 16);
   public readonly connections = new Map<ServerConnection, CarolinaConnection>();
   public constructor(public readonly carolina: Carolina) {
      this.raknet = new RakNetListener(carolina);
      this.raknet.onNewConnection = (connection): void => {
         // We do not assign the connection yet, once the connection success login then its added to the active connections
         const _ = new CarolinaConnection(this, connection);
      };
      this.raknet.onErrorHandler = console.error.bind(null, '[CarolinaServer][ERROR]');
      this.raknet.onConnectionDisconnected = (connection): void => {
         this.connections.delete(connection);
         console.log('Connection closed');
      };
   }
   protected readonly raknet: RakNetListener;
   public addListenerSource(source: SocketSource): void {
      this.raknet.addListenerSource(source);
   }
}
