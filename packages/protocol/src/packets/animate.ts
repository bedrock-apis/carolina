import { Float32, Optional, SerializeAs, Uint8, VarString, VarUint64 } from '@carolina/binary';

import { PacketCompilable, PacketType } from '../abstract';
import { AnimateSwingSource, AnimateType, PacketIds } from '../enums';

@PacketCompilable(PacketIds.Animate)
export class AnimatePacket extends PacketType {
   /**
    * The type of the animation.
    */
   @SerializeAs(Uint8) public type!: AnimateType;

   /**
    * The runtime ID of the entity.
    */
   @SerializeAs(VarUint64) public actorRuntimeId!: bigint;

   /**
    * The data of the animation.
    */
   @SerializeAs(Float32, true)
   public data!: number;

   /**
    * The swing source type of the animation.
    */
   @Optional
   @SerializeAs(VarString)
   public swingSourceType!: AnimateSwingSource | null;
}
