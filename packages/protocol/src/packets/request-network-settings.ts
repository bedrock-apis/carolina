import { Int, SerializeAs } from '@carolina/binary';

import { PacketIds } from '../enums';
import { PacketType, PacketCompilable } from '../packet';

@PacketCompilable(PacketIds.RequestNetworkSettings)
export class RequestNetworkSettingsPacket extends PacketType {
   @SerializeAs(Int, false)
   public clientNetworkVersion: number = 0;
}
