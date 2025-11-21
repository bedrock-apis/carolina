import { Cursor } from '../../cursor';
import { mergeSourceDirectNoEnumerable, VALUE_TYPE_CONSTRUCTOR_FACTORY, ValueTypeConstructor } from '../base';
import { NumberType } from '../number-type';

export interface Uint24LEConstructor extends ValueTypeConstructor<Uint24LE, number> {}

export const Uint24LE: Uint24LEConstructor = VALUE_TYPE_CONSTRUCTOR_FACTORY(
   'Uint24LE',
   0,
   NumberType
) as Uint24LEConstructor;
export interface Uint24LE extends NumberType<number> {}

mergeSourceDirectNoEnumerable(Uint24LE, {
   deserialize: function deserialize(cursor: Cursor): number {
      const $ = cursor.view.getUint16(cursor.pointer, true) | (cursor.view.getUint8((cursor.pointer += 2)) << 16);
      cursor.pointer++;
      return $;
   },
   serialize: function serialize(cursor: Cursor, value: number): void {
      cursor.view.setUint16(cursor.pointer, value & 0xffff, true);
      cursor.view.setUint8((cursor.pointer += 2), value >> 16);
      cursor.pointer++;
   },
   inliner: {
      inlineDeserializableCode: () =>
         `$.view.getUint16($.pointer, true) | ($.view.getUint8(($.pointer += 2)) << 16); $.pointer++`,
      inlineSerializableCode: $1 =>
         `$.view.setUint16($.pointer, (${$1}) & 0xffff, true);$.view.setUint8(($.pointer += 2), (${$1}) >> 16);$.pointer++`,
   },
});
