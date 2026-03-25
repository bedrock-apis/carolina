import { Cursor, VarInt32 } from '@carolina/binary';
import { DeferredRunner, MicrotaskDeferredRunner } from '@carolina/common';
import { DisconnectPacket, DisconnectReason, PacketType } from '@carolina/protocol';

import { NetworkEngineEventKeys } from '../drivers/driver';
import { CachedImmediateMessage } from './immediate-packet';
import { Server } from './server';
import { NetworkPipelineStack } from './stack';

export enum ClientState {
   Newborn,
   LoggedIn,
   Initialized,
   InWorld,
   Dead,
}
export class Client {
   public state: ClientState = ClientState.Newborn;
   public static readonly helperCursor = Cursor.create(new Uint8Array(64 * 64 * 64));
   public readonly clientId: string;
   public readonly runtimeId: number;
   public readonly server: Server;
   protected readonly deferredSend: DeferredRunner;
   protected bufferedSize = 0;
   protected readonly stack: CachedImmediateMessage[] = [];
   public readonly pipelineStack: NetworkPipelineStack = new NetworkPipelineStack();
   public constructor(clientId: string, runtimeId: number, server: Server) {
      this.clientId = clientId;
      this.runtimeId = runtimeId;
      this.server = server;
      this.pipelineStack.bound(this.server.carolina.networkPipeline, this);
      this.deferredSend = new MicrotaskDeferredRunner(() => {
         const cursor = Cursor.create(new Uint8Array(this.bufferedSize + this.stack.length * 2));
         for (let i = 0; i < this.stack.length; i++) {
            const packet = this.stack[i];
            const pointer = cursor.pointer;
            try {
               VarInt32.serialize(cursor, packet.cached?.length ?? 0);
               cursor.writeSliceSpan(packet.cached ?? new Uint8Array(0));
            } catch (error) {
               this.server.logger.error('Failed to serialize packet: ' + error);
               cursor.pointer = pointer;
            }
         }

         // Clear the stack
         this.bufferedSize = this.stack.length = 0;

         // Send it tho
         this.server.driver.send(this.runtimeId, cursor.getProcessedBytes());
      });
   }

   /** This method stacks the packets so calling this method multiple times in single frame is efficient */
   public sendMessage(cached: CachedImmediateMessage): void {
      const immediate = this.server.serializer.prepare(cached);
      this.stack.push(immediate);
      this.bufferedSize += immediate.cached?.length ?? 0;
      if (this.bufferedSize > 1024) this.deferredSend.run();
      else this.deferredSend.defer();
   }
   public send(packet: PacketType): void {
      return this.sendMessage(new CachedImmediateMessage(packet));
   }
   public toString(): string {
      return `Client<${this.clientId}>`;
   }
   public disconnect(reason: DisconnectReason = DisconnectReason.NoReason): void {
      const disconnect = new DisconnectPacket();
      disconnect.reason = reason;
      disconnect.hideDisconnectScreen = true;
      this.send(disconnect);
      this.deferredSend.run();
      this.server.driver.dispatch(NetworkEngineEventKeys.Disconnect, { runtimeId: this.runtimeId });
   }
}
