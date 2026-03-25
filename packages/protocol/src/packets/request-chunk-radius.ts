import { SerializeAs, Uint8, ZigZag32 } from '@carolina/binary';

import { PacketCompilable, PacketType } from '../abstract';
import { PacketIds } from '../enums';

@PacketCompilable(PacketIds.RequestChunkRadius)
class RequestChunkRadiusPacket extends PacketType {
   @SerializeAs(ZigZag32) public radius!: number;
   @SerializeAs(Uint8) public maxRadius!: number;
}

export { RequestChunkRadiusPacket };
