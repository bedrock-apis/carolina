import { SerializeAs } from '@carolina/binary';

import { PacketIds } from '../../../enums';
import { PacketCompilable, PacketType } from '../../../packet';
import { EntityRuntimeIdType } from '../types';

@PacketCompilable(PacketIds.SetLocalPlayerAsInitialized)
export class SetLocalPlayerAsInitializedPacket extends PacketType {
   @SerializeAs(EntityRuntimeIdType) public runtimeEntityId!: bigint;
}
