import { Cursor } from '../../cursor';
import { mergeSourceDirectNoEnumerable, VALUE_TYPE_CONSTRUCTOR_FACTORY, ValueTypeConstructor } from '../base';
import { NumberType } from '../number-type';

export interface ByteConstructor extends ValueTypeConstructor<Byte, number> {}

export const Byte: ByteConstructor = VALUE_TYPE_CONSTRUCTOR_FACTORY('Byte', 0, NumberType) as ByteConstructor;
export interface Byte extends NumberType<number> {}

mergeSourceDirectNoEnumerable(Byte, {
   deserialize: function deserialize(cursor: Cursor): number {
      return cursor.buffer[cursor.pointer++];
   },
   serialize: function serialize(cursor: Cursor, value: number): void {
      cursor.buffer[cursor.pointer++] = value;
   },
   inliner: {
      inlineDeserializableCode: () => `$.buffer[$.pointer++]`,
      inlineSerializableCode: $1 => `$.buffer[$.pointer++] = ${$1}`,
   },
});
