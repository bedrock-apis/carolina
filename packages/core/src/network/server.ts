import { a, EventEmitter } from '@carolina/common';

import { Carolina } from '../carolina';
import { NetworkDriver, NetworkEngineEventKeys } from '../drivers/driver';
import { Client } from './client';

export interface ServerEvents {
   connected: { client: Client };
   disconnected: { client: Client };
   message: { client: Client; message: Uint8Array };
}
export class Server {
   public readonly carolina: Carolina;
   public readonly driver: NetworkDriver;
   public readonly events: EventEmitter<ServerEvents> = new EventEmitter();
   public readonly clients: Map<number, Client> = new Map();
   public constructor(carolina: Carolina, driver: NetworkDriver) {
      this.carolina = carolina;
      this.driver = driver;
      this.driver.incoming.set(NetworkEngineEventKeys.Connect, ({ clientId, runtimeId }) => {
         this.carolina.logger.log(a`Driver connection connected: ${clientId}`);
         if (this.clients.has(runtimeId)) {
            this.carolina.logger.error(
               a`Logic Error that should never happen, client already exists, runtimeId: ${runtimeId}, clientId: ${clientId}`
            );
            return;
         }
         const client = new Client(clientId, runtimeId, this);
         this.clients.set(runtimeId, client);
         this.events.dispatch('connected', { client });
      });
      this.driver.incoming.set(NetworkEngineEventKeys.Disconnect, ({ clientId, runtimeId }) => {
         this.carolina.logger.log(a`Driver connection disconnected: ${clientId}`);
         const client = this.clients.get(runtimeId);
         if (!client) {
            this.carolina.logger.error(
               a`Logic Error that should never happen, client that is not registered had disconnected, runtimeId: ${runtimeId}, clientId: ${clientId}`
            );
            return;
         }
         this.clients.delete(runtimeId);
         this.events.dispatch('disconnected', { client });
      });
      this.driver.incoming.set(NetworkEngineEventKeys.Message, ({ message, runtimeId }) => {
         const client = this.clients.get(runtimeId);
         if (!client) {
            this.carolina.logger.error(
               a`Logic Error that should never happen, client that is not registered had received message, runtimeId: ${runtimeId}`
            );
            return;
         }
         this.events.dispatch('message', { client, message });
      });
   }
}
