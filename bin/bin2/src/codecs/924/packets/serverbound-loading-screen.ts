import { SerializeAs, ZigZag32 } from '@carolina/binary';

import { PacketIds, ServerboundLoadingScreenType } from '../../../enums';
import { PacketCompilable, PacketType } from '../../../packet';

@PacketCompilable(PacketIds.ServerboundLoadingScreen)
export class ServerboundLoadingScreenPacket extends PacketType {
   @SerializeAs(ZigZag32) public type!: ServerboundLoadingScreenType;
   @SerializeAs(Boolean) public hasScreenId!: boolean;
}
