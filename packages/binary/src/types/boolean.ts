import { Cursor } from '../cursor';
import { mergeSourceDirectNoEnumerable } from './base';
import { SerializableType } from './serializable-type';
declare global {
   interface BooleanConstructor extends SerializableType<boolean> {}
}

mergeSourceDirectNoEnumerable(Boolean, {
   deserialize: function deserialize(cursor: Cursor): boolean {
      return Boolean(cursor.buffer[cursor.pointer++]);
   },
   serialize: function serialize(cursor: Cursor, value: boolean): void {
      cursor.buffer[cursor.pointer++] = Number(value);
   },
   inliner: {
      inlineDeserializableCode: () => `Boolean($.buffer[$.pointer++])`,
      inlineSerializableCode: $1 => `$.buffer[$.pointer++] = Number(${$1})`,
   },
   getIdentifier() {
      return Boolean.name;
   },
});
const bool = Boolean;
export { bool as Boolean };
