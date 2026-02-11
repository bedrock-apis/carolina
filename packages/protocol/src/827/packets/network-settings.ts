import { Byte, Float, SerializeAs, Short } from '@carolina/binary';

import { PacketCompilable, PacketType } from '../../packet';
import { PacketCompressionAlgorithm, PacketIds } from '../enums';

@PacketCompilable(PacketIds.NetworkSettings)
export class NetworkSettingsPacket extends PacketType {
   @SerializeAs(Short, true)
   public compressionThreshold = 1;
   @SerializeAs(Short, true)
   public compressionAlgorithm: PacketCompressionAlgorithm = PacketCompressionAlgorithm.Zlib;
   @SerializeAs(Boolean)
   public clientThrottleEnabled = false;
   @SerializeAs(Byte)
   public clientThrottleThreshold = 0;
   @SerializeAs(Float, true)
   public clientThrottleScalar = 0;
}
