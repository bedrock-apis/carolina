import { LengthEncodeAs, SerializeAs, VarInt32, Uint32 } from '@carolina/binary';
import { Vector3 } from '@carolina/common';

import { PacketCompilable, PacketType } from '../abstract';
import { PacketIds } from '../enums';
import { BlockLocation, ChunkCoords, IChunkCoords } from '../types';

@PacketCompilable(PacketIds.NetworkChunkPublisherUpdate)
export class NetworkChunkPublisherUpdatePacket extends PacketType {
   @SerializeAs(BlockLocation) public coordinate!: Vector3;
   @SerializeAs(VarInt32) public radius!: number;
   @SerializeAs(ChunkCoords)
   @LengthEncodeAs(Uint32, true)
   public savedChunks!: Array<IChunkCoords>;
}
