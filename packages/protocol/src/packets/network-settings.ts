import { Byte, Float, SerializeAs, Short } from '@carolina/binary';

import { PacketCompressionAlgorithm, PacketIds } from '../enums';
import { PacketType, PacketCompilable } from '../packet';

@PacketCompilable(PacketIds.NetworkSettings)
export class NetworkSettingsPacket extends PacketType {
   @SerializeAs(Short, true)
   public compressionThreshold: number = 1;
   @SerializeAs(Short, true)
   public compressionAlgorithm: PacketCompressionAlgorithm = 0;
   @SerializeAs(Boolean)
   public clientThrottleEnabled: boolean = false;
   @SerializeAs(Byte)
   public clientThrottleThreshold: number = 0;
   @SerializeAs(Float, true)
   public clientThrottleScalar: number = 0;
}
