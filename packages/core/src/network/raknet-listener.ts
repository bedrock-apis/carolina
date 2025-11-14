import '@carolina/common';
import { AddressInfo, ServerConnectionListener } from '@carolina/raknet';
import { type Carolina } from '../carolina';

export class RakNetListener extends ServerConnectionListener {
   protected temporaryMOTD!: Uint8Array;
   public readonly discoveryStats!: MotdInformation;
   public constructor(public readonly carolina: Carolina) {
      super();
      this.setDiscoveryStats({
         provider: carolina.providerName,
         protoVersion: 835,
         engineVersion: '1.0.0.1',
         gameMode: 'Adventure',
         maxPlayers: 50,
         onlinePlayers: this.connections.size,
         serverGuid: this.guid,
         worldName: 'World Name',
      });
   }
   public override getMOTD(receiver: AddressInfo): Uint8Array {
      return this.temporaryMOTD;
   }
   public setDiscoveryStats(motdInformation: MotdInformation): void {
      const { provider, protoVersion, engineVersion, onlinePlayers, maxPlayers, serverGuid, worldName, gameMode } = ((
         this as Mutable<this>
      ).discoveryStats = motdInformation);
      this.temporaryMOTD = new TextEncoder().encode(
         `MCPE;${provider};${protoVersion};${engineVersion};${onlinePlayers};${maxPlayers};${serverGuid};${worldName};${gameMode};`,
      );
   }
}

export interface MotdInformation {
   readonly provider: string;
   readonly protoVersion: number;
   readonly engineVersion: string;
   readonly onlinePlayers: number;
   readonly maxPlayers: number;
   readonly serverGuid: bigint;
   readonly worldName: string;
   readonly gameMode: 'Survival' | 'Creative' | 'Adventure';
}
