import { Int32, SerializeAs } from '@carolina/binary';

import { PacketIds } from '../../../enums';
import { PacketCompilable, PacketType } from '../../../packet';

@PacketCompilable(PacketIds.RequestNetworkSettings)
export class RequestNetworkSettingsPacket extends PacketType {
   @SerializeAs(Int32, false)
   public clientNetworkVersion = 0;
}
