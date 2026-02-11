import { Int, SerializeAs } from '@carolina/binary';

import { PacketCompilable, PacketType } from '../../packet';
import { PacketIds } from '../enums';

@PacketCompilable(PacketIds.RequestNetworkSettings)
export class RequestNetworkSettingsPacket extends PacketType {
   @SerializeAs(Int, false)
   public clientNetworkVersion = 0;
}
