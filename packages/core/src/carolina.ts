import { a, Logger, rgb } from '@carolina/common';

import { NETWORK_LAN_DISCOVERY_PORT4 } from './constants';
import { RaknetNetworkEngine, SyncNetworkDriver, UDPEndpointHandle } from './drivers/network';
import { Server } from './network/server';
import { TickManager } from './timing/tick-manager';

export class Carolina {
   public constructor() {}
   public readonly logger = new Logger(rgb(150, 150, 230)(Carolina.name));
   public readonly tick: TickManager = new TickManager();
   public providerName: string = Carolina.name;
   public readonly server: Server = new Server(this, new SyncNetworkDriver(new RaknetNetworkEngine()));
   public async start(): Promise<void> {
      this.logger.info(a`Starting ${this} instance`);
      this.logger.info(a`Opening port on ${NETWORK_LAN_DISCOVERY_PORT4}`);
      const udpHandle = await UDPEndpointHandle.create(NETWORK_LAN_DISCOVERY_PORT4);
      udpHandle.with(this.server.driver);
      this.logger.info(a`Running ticking manager`);
      await this.tick.start();
   }
   public toString(): string {
      return this.constructor.name;
   }
}
