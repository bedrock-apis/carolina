import { InjectAsNoEnumerableStruct } from '@carolina/common';

import { EncodingCompilable, OutputKind } from '../../compiler';
import { VALUE_TYPE_CONSTRUCTOR_FACTORY, ValueTypeConstructor } from '../value-type';
import { NumberType } from './common-number-type';

export interface Uint24LEConstructor extends ValueTypeConstructor<Uint24LE, number>, EncodingCompilable {}
export interface Uint24LE extends NumberType<number> {}
export const Uint24LE: Uint24LEConstructor = VALUE_TYPE_CONSTRUCTOR_FACTORY(
   'Uint24LE',
   0,
   NumberType
) as Uint24LEConstructor;

InjectAsNoEnumerableStruct(Uint24LE, {
   deserialize(cursor) {
      const $ =
         cursor.view.getUint16(cursor.pointer, true) | (cursor.view.getUint8((cursor.pointer += 2)) << 16);
      cursor.pointer++;
      return $;
   },
   serialize(cursor, value): void {
      cursor.view.setUint16(cursor.pointer, value & 0xffff, true);
      cursor.view.setUint8((cursor.pointer += 2), value >> 16);
      cursor.pointer++;
   },
   compile(context) {
      const [cursor] = context.environments;
      const { input } = context.getStrategy();
      return {
         deserialization: `${cursor}.view.getUint16(${cursor}.pointer, true) | (${cursor}.view.getUint8((${cursor}.pointer += 2)) << 16); ${cursor}.pointer++`,
         serialization: `${cursor}.view.setUint16(${cursor}.pointer, (${input}) & 0xffff, true); ${cursor}.view.setUint8((${cursor}.pointer += 2), (${input}) >> 16); ${cursor}.pointer++`,
         kind: OutputKind.BareBone,
      };
   },
});
