import { Cursor } from '../../cursor';
import { mergeSourceDirectNoEnumerable, VALUE_TYPE_CONSTRUCTOR_FACTORY, ValueTypeConstructor } from '../base';
import { NumberType } from '../number-type';

export const VarInt: ValueTypeConstructor<VarInt, number> = VALUE_TYPE_CONSTRUCTOR_FACTORY(
   'VarInt',
   0,
   NumberType
) as ValueTypeConstructor<VarInt, number>;
export interface VarInt extends NumberType<number> {}

mergeSourceDirectNoEnumerable(VarInt, {
   deserialize: function deserialize(cursor: Cursor): number {
      for (let i = 0, shift = 0, num = 0; i < 5; i++, shift += 7) {
         const byte = cursor.buffer[cursor.pointer++];
         num |= (byte & 0x7f) << shift;
         if ((byte & 0x80) === 0) return num;
      }
      throw new Error('VarInt32 too long: exceeds 5 bytes');
   },
   serialize: function serialize(cursor: Cursor, value: number): void {
      for (let i = 0; i < 5; i++) {
         if ((value & ~0x7f) === 0) return void (cursor.buffer[cursor.pointer++] = value);
         cursor.buffer[cursor.pointer++] = (value & 0x7f) | 0x80;
         value >>>= 7;
      }
   },
});
