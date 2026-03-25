import { Int32, SerializeAs } from '@carolina/binary';

import { PacketIds } from '../../../enums';
import { PlayStatus } from '../../../enums/play-status';
import { PacketCompilable, PacketType } from '../../../packet';

@PacketCompilable(PacketIds.PlayStatus)
export class PlayStatusPacket extends PacketType {
   @SerializeAs(Int32, false) public status!: PlayStatus;
}
