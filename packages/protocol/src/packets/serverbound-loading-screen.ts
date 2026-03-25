import { SerializeAs, ZigZag32 } from '@carolina/binary';

import { PacketCompilable, PacketType } from '../abstract';
import { PacketIds, LoadingScreenType } from '../enums';

@PacketCompilable(PacketIds.ServerboundLoadingScreen)
export class ServerboundLoadingScreenPacket extends PacketType {
   @SerializeAs(ZigZag32) public type!: LoadingScreenType;
   @SerializeAs(Boolean) public hasScreenId!: boolean;
}
