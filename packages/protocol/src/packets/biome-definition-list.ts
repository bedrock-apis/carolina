import { SerializeAs, VarInt32 } from '@carolina/binary';

import { PacketCompilable, PacketType } from '../abstract';
import { PacketIds } from '../enums';

@PacketCompilable(PacketIds.BiomeDefinitionList)
export class BiomeDefinitionListPacket extends PacketType {
   @SerializeAs(VarInt32) public lengthX!: number;
   @SerializeAs(VarInt32) public lengthY!: number;
}
