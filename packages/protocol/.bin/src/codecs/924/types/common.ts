import { AbstractType, Cursor, VarUint64, ZigZag32, ZigZag64 } from '@carolina/binary';

/**
 * Common protocol type aliases
 */
export const GameModeType = ZigZag32;
export const EntityIdType = ZigZag64;
export const EntityRuntimeIdType = VarUint64;
export const PlayerInputTick = VarUint64;

/**
 * Handles Minecraft-style UUID serialization
 */
export class UUID extends AbstractType {
   protected readonly value: string;
   public static override serialize<T extends AbstractType>(
      this: new () => T,
      _cursor: Cursor,
      _value: T
   ): void {
      const raw = _value.toString().replaceAll('-', '');
      const buffer = Uint8Array.fromHex(raw);
      buffer.subarray(0, 8).reverse();
      buffer.subarray(8, 16).reverse();
      _cursor.writeSliceSpan(buffer);
   }
   public static override deserialize<T extends AbstractType>(this: new () => T, _cursor: Cursor): T {
      const msb = _cursor.getSliceSpan(8).reverse();
      const lsb = _cursor.getSliceSpan(8).reverse();
      return new (this as new (value: string) => T)(
         `${msb.subarray(0, 4).toHex()}-${msb.subarray(4, 6).toHex()}-${msb.subarray(6, 8).toHex()}-${lsb.subarray(0, 4).toHex()}-${lsb.subarray(4).toHex()}`
      );
   }
   public constructor(value: string) {
      super();
      this.value = value;
   }
   public override toString(): string {
      return this.value;
   }
}
