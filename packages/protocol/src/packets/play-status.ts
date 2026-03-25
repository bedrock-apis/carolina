import { Int32, SerializeAs } from '@carolina/binary';

import { PacketCompilable, PacketType } from '../abstract';
import { PacketIds, PlayStatus } from '../enums';

@PacketCompilable(PacketIds.PlayStatus)
export class PlayStatusPacket extends PacketType {
   @SerializeAs(Int32, false) public status!: PlayStatus;
}
