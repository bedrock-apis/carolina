import { Boolean, Int32, LengthEncodeAs, SerializeAs, VarString, VarUint32 } from '@carolina/binary';

import { PacketCompilable, PacketType } from '../abstract';
import { PacketIds } from '../enums';
import { ResourceIdVersions, ResourceIdVersionsType, WorldExperiment, WorldExperimentType } from '../types';

@PacketCompilable(PacketIds.ResourcePackStack)
export class ResourcePackStackPacket extends PacketType {
   @SerializeAs(Boolean)
   public mustAccept!: boolean;

   @SerializeAs(ResourceIdVersionsType)
   @LengthEncodeAs(VarUint32)
   public texturePacks!: Array<ResourceIdVersions>;

   @SerializeAs(VarString)
   public gameVersion!: string;

   @SerializeAs(WorldExperimentType)
   @LengthEncodeAs(Int32, true)
   public experiments!: Array<WorldExperiment>;

   @SerializeAs(Boolean)
   public experimentsPreviouslyToggled!: boolean;

   @SerializeAs(Boolean)
   public hasEditorPacks!: boolean;
}
