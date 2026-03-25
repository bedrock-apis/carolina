import { InjectAsNoEnumerableStruct } from '@carolina/common';

import { Cursor } from '../../../cursor';
import { SerializableType } from '../../base';
import { EncodingCompilable, OutputKind } from '../../compiler';
// Declaration
export const { Boolean } = globalThis;
declare global {
   interface BooleanConstructor extends SerializableType<boolean> {}
   interface BooleanConstructor extends EncodingCompilable {}
}

// Code
InjectAsNoEnumerableStruct(Boolean, {
   deserialize: function deserialize(cursor: Cursor): boolean {
      return cursor.view.getUint8(cursor.pointer++) !== 0;
   },
   serialize(cursor, value) {
      cursor.view.setUint8(cursor.pointer++, value ? 1 : 0);
   },
   getIdentifier() {
      return Boolean.name;
   },
   compile(context) {
      const [cursor] = context.environments;
      const { input } = context.getStrategy();
      return {
         serialization: `${cursor}.view.setUint8(${cursor}.pointer++,(${input})?1:0)`,
         deserialization: `${cursor}.view.getUint8(${cursor}.pointer++)!==0`,
         kind: OutputKind.BareBone,
      };
   },
});
