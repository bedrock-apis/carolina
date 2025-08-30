import { Byte, Float, SerializeAs, Short } from '@carolina/binary';
import { PacketType, PacketCompilable } from '../packet';
import { PacketCompressionAlgorithm, PacketIds } from '../enums';

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
