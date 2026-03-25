import { AbstractType, CompilableInterface, InterfaceOf, SerializeAs, ZigZag32 } from '@carolina/binary';

@CompilableInterface
export class ChunkCoords extends AbstractType {
   @SerializeAs(ZigZag32)
   public x: number = 0;
   @SerializeAs(ZigZag32)
   public z: number = 0;
}

export type IChunkCoords = InterfaceOf<ChunkCoords>;
