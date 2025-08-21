import { BaseConnection } from './base-connection';

export class ServerConnection extends BaseConnection {
   /**@internal */
   public onDisconnect?: () => void;
   public override disconnect(): void {
      super.disconnect();
      this.onDisconnect?.();
   }
}
