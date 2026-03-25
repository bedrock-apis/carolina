import { AbstractType, CompilableInterface, Float32, SerializeAs, ZigZag32 } from '@carolina/binary';

/**
 * A 3D vector using floating point numbers
 */
@CompilableInterface
export class Vector3f extends AbstractType {
   @SerializeAs(Float32, true)
   public x!: number;
   @SerializeAs(Float32, true)
   public y!: number;
   @SerializeAs(Float32, true)
   public z!: number;
}

/**
 * A 3D vector using floating point numbers
 */
@CompilableInterface
export class Vector2f extends AbstractType {
   @SerializeAs(Float32, true)
   public x!: number;
   @SerializeAs(Float32, true)
   public y!: number;
}
/**
 * A coordinate representing a block position
 */
@CompilableInterface
export class BlockLocation extends AbstractType {
   @SerializeAs(ZigZag32)
   public x!: number;
   @SerializeAs(ZigZag32)
   public y!: number;
   @SerializeAs(ZigZag32)
   public z!: number;
}
