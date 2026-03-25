import {
   Buffer,
   Conditional,
   LengthEncodeAs,
   Optional,
   SerializeAs,
   Uint16,
   Uint64,
   VarInt32,
   VarUint32,
   ZigZag32,
} from '@carolina/binary';

import { PacketCompilable, PacketType } from '../abstract';
import { DimensionKind, PacketIds } from '../enums';

@PacketCompilable(PacketIds.LevelChunk)
export class LevelChunkPacket extends PacketType {
   @SerializeAs(ZigZag32) public x!: number;
   @SerializeAs(ZigZag32) public z!: number;
   @SerializeAs(VarInt32) public dimension!: DimensionKind;
   @SerializeAs(VarInt32) public subChunkCount!: number;

   @Conditional('subChunkCount', '$==-2')
   @SerializeAs(Uint16, true)
   public highestSubChunkCount?: number;

   @Optional
   @SerializeAs(Uint64, true)
   @LengthEncodeAs(VarUint32)
   public blobs?: Array<bigint>;

   @SerializeAs(Buffer(VarInt32))
   public data!: Uint8Array;
}
