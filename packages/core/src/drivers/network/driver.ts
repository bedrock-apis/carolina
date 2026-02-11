import { Driver } from '../driver';
import { NetworkEngineEventKeys } from './engine/network-engine';

export interface IncomingEvents {
   [NetworkEngineEventKeys.Connect]: { clientId: string; runtimeId: number };
   [NetworkEngineEventKeys.Disconnect]: { clientId: string; runtimeId: number };
   [NetworkEngineEventKeys.Message]: { runtimeId: number; message: Uint8Array };
}
export interface OutgoingEvents {
   [NetworkEngineEventKeys.Disconnect]: { runtimeId: number };
   'discovery-options': { enabled?: boolean; motd?: string };
   [NetworkEngineEventKeys.Message]: { runtimeId: number; message: Uint8Array };
}
export abstract class NetworkDriver extends Driver<IncomingEvents, OutgoingEvents> {
   public send(runtimeId: number, message: Uint8Array): void {
      this.dispatch(NetworkEngineEventKeys.Message, { runtimeId: runtimeId, message });
   }
   public abstract dispose(): void;
}
