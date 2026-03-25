import { Uint8, Float32, SerializeAs, Uint16 } from '@carolina/binary';

import { PacketCompilable, PacketType } from '../abstract';
import { PacketCompressionAlgorithm, PacketIds } from '../enums';

@PacketCompilable(PacketIds.NetworkSettings)
export class NetworkSettingsPacket extends PacketType {
   @SerializeAs(Uint16, true)
   public compressionThreshold = 1;
   @SerializeAs(Uint16, true)
   public compressionAlgorithm: PacketCompressionAlgorithm = PacketCompressionAlgorithm.Zlib;
   @SerializeAs(Boolean)
   public clientThrottleEnabled = false;
   @SerializeAs(Uint8)
   public clientThrottleThreshold = 0;
   @SerializeAs(Float32, true)
   public clientThrottleScalar = 0;
}
