import { Int32, SerializeAs } from '@carolina/binary';

import { PacketCompilable, PacketType } from '../abstract';
import { PacketIds } from '../enums';

@PacketCompilable(PacketIds.RequestNetworkSettings)
export class RequestNetworkSettingsPacket extends PacketType {
   @SerializeAs(Int32, false)
   public clientNetworkVersion = 0;
}
