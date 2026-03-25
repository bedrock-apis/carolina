import { LengthEncodeAs, SerializeAs, VarUint32 } from '@carolina/binary';

import { PacketCompilable, PacketType } from '../abstract';
import { PacketIds } from '../enums';
import { EntityRuntimeIdType, UUID } from '../types';

@PacketCompilable(PacketIds.EmoteList)
export class EmoteListPacket extends PacketType {
   /**
    * The type of the animation.
    */
   @SerializeAs(EntityRuntimeIdType) public runtimeId!: bigint;
   /**
    * The swing source type of the animation.
    */
   @LengthEncodeAs(VarUint32)
   @SerializeAs(UUID)
   public emotePieces!: string[];
}
