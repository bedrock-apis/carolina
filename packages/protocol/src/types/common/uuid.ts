import { Cursor } from '@carolina/binary';

/**
 * Handles UUID serialization
 */
export abstract class UUID {
   public static serialize(cursor: Cursor, value: string): void {
      const raw = value.replaceAll('-', '');
      const buffer = Uint8Array.fromHex(raw);
      buffer.subarray(0, 8).reverse();
      buffer.subarray(8, 16).reverse();
      cursor.writeSliceSpan(buffer);
   }
   public static deserialize(cursor: Cursor): string {
      const msb = cursor.getSliceSpan(8).reverse();
      const lsb = cursor.getSliceSpan(8).reverse();
      return `${msb.subarray(0, 4).toHex()}-${msb.subarray(4, 6).toHex()}-${msb.subarray(6, 8).toHex()}-${lsb.subarray(0, 4).toHex()}-${lsb.subarray(4).toHex()}`;
   }
   public static getIdentifier(): string {
      return UUID.name;
   }
}
