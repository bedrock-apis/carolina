import { SerializeAs } from '@carolina/binary';

import { PacketCompilable, PacketType } from '../abstract';
import { PacketIds } from '../enums';
import { EntityRuntimeIdType } from '../types';

@PacketCompilable(PacketIds.SetLocalPlayerAsInitialized)
export class SetLocalPlayerAsInitializedPacket extends PacketType {
   @SerializeAs(EntityRuntimeIdType) public runtimeEntityId!: bigint;
}
