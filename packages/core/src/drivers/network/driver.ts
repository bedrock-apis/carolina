import { Driver } from '../driver';
import { NetworkEngineEventKeys } from './engine/network-engine';

export interface IncomingEvents {
   [NetworkEngineEventKeys.Connect]: { clientId: string; runtimeId: number };
   [NetworkEngineEventKeys.Disconnect]: { clientId: string; runtimeId: number };
   [NetworkEngineEventKeys.Message]: { runtimeId: number; message: Uint8Array };
}
export interface DiscoveryOptions {
   maxPlayers: number;
   onlinePlayers: number;
   provider: string;
   level: string;
   version: string;
   protocol: number;
   gameMode: 'Survival' | 'Creative' | 'Adventure' | 'Unknown' | null;
   discoverable: boolean | null;
   isEditor: boolean | null;
}
export interface OutgoingEvents {
   [NetworkEngineEventKeys.Disconnect]: { runtimeId: number };
   'discovery-options': DiscoveryOptions;
   [NetworkEngineEventKeys.Message]: { runtimeId: number; message: Uint8Array };
}
export abstract class NetworkDriver extends Driver<IncomingEvents, OutgoingEvents> {
   public send(runtimeId: number, message: Uint8Array): void {
      this.dispatch(NetworkEngineEventKeys.Message, { runtimeId: runtimeId, message });
   }
}
