import { NetworkServer } from './network/server';
import { TickManager } from './timing/tick-manager';

export class Carolina {
   public readonly tick: TickManager = new TickManager();
   public providerName: string = Carolina.name;
   public readonly server: NetworkServer = new NetworkServer(this);
   public constructor() {}
   public async start(): Promise<void> {
      await this.tick.start();
   }
}
