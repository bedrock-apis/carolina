import { Cursor } from '../../cursor';
import { mergeSourceDirectNoEnumerable, VALUE_TYPE_CONSTRUCTOR_FACTORY, ValueTypeConstructor } from '../base';
import { NumberType } from '../number-type';

export const VarLong: ValueTypeConstructor<VarLong, bigint> = VALUE_TYPE_CONSTRUCTOR_FACTORY(
   'VarLong',
   0n,
   NumberType
) as ValueTypeConstructor<VarLong, bigint>;
export interface VarLong extends NumberType<bigint> {}

mergeSourceDirectNoEnumerable(VarLong, {
   deserialize: function deserialize(cursor: Cursor): bigint {
      for (let i = 0, shift = 0n, num = 0n; i < 10; i++, shift += 7n) {
         const byte = BigInt(cursor.buffer[cursor.pointer++]);
         num |= (byte & 0x7fn) << shift;
         if ((byte & 0x80n) === 0n) return num;
      }
      throw new Error('VarInt64 too long: exceeds 10 bytes');
   },
   serialize: function serialize(cursor: Cursor, value: bigint): void {
      for (let i = 0; i < 10; i++) {
         if ((value & ~0x7fn) === 0n) return void (cursor.buffer[cursor.pointer++] = Number(value));
         cursor.buffer[cursor.pointer++] = Number((value & 0x7fn) | 0x80n);
         value >>= 7n;
      }
   },
});
