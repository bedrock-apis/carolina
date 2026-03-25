import { a, Logger, rgb } from '@carolina/common';
import { PROTOCOL_VERSION } from '@carolina/protocol';

import { NETWORK_ANY_ADDRESS6, NETWORK_LAN_DISCOVERY_PORT4, NETWORK_LAN_DISCOVERY_PORT6 } from './constants';
import { RaknetNetworkEngine, SyncNetworkDriver, UDPEndpointHandle } from './drivers/network';
import { Server } from './network/server';
import { CarolinaBehaviorPipeline } from './pipelines/behavior/carolina';
import { CarolinaNetworkPipeline } from './pipelines/network/carolina';
import { TickManager } from './timing/tick-manager';
import { World } from './world';
import { WorldsManager } from './world/manager';

export class Carolina {
   public constructor() {
      this.logger = new Logger(rgb(150, 150, 230)(new.target.name));
      this.tickManager = new TickManager();
      this.worldManager = new WorldsManager(this);
      this.networkServer = new Server(this, new SyncNetworkDriver(new RaknetNetworkEngine()));
      this.providerName = new.target.name;
      // Pipelines
      this.networkPipeline = CarolinaNetworkPipeline.create(this);
      this.behaviorPipeline = CarolinaBehaviorPipeline.create(this);
      this.world = new World(this, null!, '');
   }
   public readonly logger: Logger;
   public readonly tickManager: TickManager;
   public readonly worldManager: WorldsManager;
   public readonly networkServer: Server;
   public readonly networkPipeline: CarolinaNetworkPipeline;
   public readonly behaviorPipeline: CarolinaBehaviorPipeline;
   public readonly world: World;
   protected isInitialized = false;
   public providerName: string;
   public async start(): Promise<void> {
      if (!this.isInitialized) await this.initialize();
      this.logger.info(a`Starting ${this} instance`);
      this.logger.info(a`Opening port on ${NETWORK_LAN_DISCOVERY_PORT4} for IPv4`);
      const udpHandle = await UDPEndpointHandle.create(NETWORK_LAN_DISCOVERY_PORT4);
      this.logger.info(a`Opening port on ${NETWORK_LAN_DISCOVERY_PORT6} for IPv6`);
      const udpHandle2 = await UDPEndpointHandle.create(
         NETWORK_LAN_DISCOVERY_PORT6,
         NETWORK_ANY_ADDRESS6,
         true
      );
      udpHandle.with(this.networkServer.driver);
      udpHandle2.with(this.networkServer.driver);
      this.logger.info(a`Spinning up ${TickManager.name}`);
      await this.tickManager.start();
   }
   public async initialize(): Promise<void> {
      this.networkServer.driver.dispatch('discovery-options', {
         discoverable: true,
         gameMode: 'Adventure',
         level: 'AQUALIDERIUM - THE NEVER END',
         maxPlayers: 50,
         onlinePlayers: 1,
         protocol: PROTOCOL_VERSION,
         isEditor: false,
         provider: this.providerName,
         version: '1.26.10',
      });
   }
   public async shutdown(): Promise<void> {
      await this.tickManager.shutdown();
   }
   public toString(): string {
      return this.providerName;
   }
}
