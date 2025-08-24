import { Int, SerializeAs } from '@carolina/binary';
import { PacketType, PacketCompilable } from '../packet';
import { PacketIds } from '../enums';

@PacketCompilable(PacketIds.RequestNetworkSettings)
export class RequestNetworkSettings extends PacketType {
   @SerializeAs(Int, false)
   public clientNetworkVersion: number = 0;
}
