import { ImmediateCachedPackedFrame } from './immediate-packet';
import { Server } from './server';

export class Client {
   public readonly clientId: string;
   public readonly runtimeId: number;
   public readonly server: Server;
   public constructor(clientId: string, runtimeId: number, server: Server) {
      this.clientId = clientId;
      this.runtimeId = runtimeId;
      this.server = server;
   }
   public sendMessage(_framer: ImmediateCachedPackedFrame): void {
      this.server.driver.send(this.runtimeId, null as unknown as Uint8Array);
   }
}
