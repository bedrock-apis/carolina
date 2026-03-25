import { Cursor, VarInt32 } from '@carolina/binary';
import { a, EventEmitter, Logger, rgb } from '@carolina/common';
import { PacketIds } from '@carolina/protocol';

import { Carolina } from '../carolina';
import { NetworkDriver, NetworkEngineEventKeys } from '../drivers/driver';
import { Client } from './client';
import { Framer } from './framer';
import { SerializeHelper } from './serializer-helper';

export interface ServerEvents {
   connected: { client: Client };
   disconnected: { client: Client };
   message: { client: Client; message: Uint8Array };
}
export class Server {
   public readonly serializer: SerializeHelper = new SerializeHelper();
   public readonly carolina: Carolina;
   public readonly logger: Logger;
   public readonly driver: NetworkDriver;
   public readonly events: EventEmitter<ServerEvents> = new EventEmitter();
   public readonly clients: Map<number, Client> = new Map();
   public constructor(carolina: Carolina, driver: NetworkDriver) {
      this.carolina = carolina;
      this.logger = new Logger(rgb(81, 202, 180)(Server.name), this.carolina.logger);
      this.driver = driver;
      this.driver.incoming.set(NetworkEngineEventKeys.Connect, ({ clientId, runtimeId }) => {
         this.logger.log(a`Driver connection connected: ${clientId}`);
         if (this.clients.has(runtimeId)) {
            this.logger.error(
               a`Logic Error that should never happen, client already exists, runtimeId: ${runtimeId}, clientId: ${clientId}`
            );
            return;
         }
         const client = new Client(clientId, runtimeId, this);
         this.clients.set(runtimeId, client);
         this.events.dispatch('connected', { client });
      });
      this.driver.incoming.set(NetworkEngineEventKeys.Disconnect, ({ clientId, runtimeId }) => {
         this.logger.log(a`Driver connection disconnected: ${clientId}`);
         const client = this.clients.get(runtimeId);
         if (!client) {
            this.logger.error(
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
            this.logger.error(
               a`Logic Error that should never happen, client that is not registered had received message, runtimeId: ${runtimeId}`
            );
            return;
         }
         this.dispatch(message, client);
         this.events.dispatch('message', { client, message });
      });
   }
   protected dispatch(message: Uint8Array, client: Client): void {
      for (const frame of Framer.getFramesIterator(Cursor.create(message))) {
         const packetId = VarInt32.deserialize(frame);
         if (!client.pipelineStack.distribute(packetId, frame))
            this.logger.debug(a`Packet not handled ${PacketIds[packetId] ?? packetId}`);
      }
   }
}
