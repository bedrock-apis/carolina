import { NetworkConnection } from '@carolina/net';
import { NetworkSettingsPacket, PacketCompressionAlgorithm } from '@carolina/protocol';

let NEXT_ID = Number.MIN_SAFE_INTEGER;
export class DriverConnection {
   public skipNetworkSettingsResolution = true;
   public readonly networkSettings = new NetworkSettingsPacket();
   public readonly runtimeId: number = NEXT_ID++;
   public readonly uniqueId: string;
   public constructor(public readonly connection: NetworkConnection) {
      this.uniqueId = connection.uniqueId;
      this.networkSettings.compressionAlgorithm = PacketCompressionAlgorithm.Zlib;
      this.networkSettings.compressionThreshold = 256;
   }
}
