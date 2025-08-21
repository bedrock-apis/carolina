import { Cursor } from '../cursor';
import { mergeSourceDirectNoEnumerable, VALUE_TYPE_CONSTRUCTOR_FACTORY, ValueType, ValueTypeConstructor } from './base';

export interface InternalValueType<T> extends ValueType<T> {
   deserialize<S extends InternalValueType<T>>(this: new () => S, cursor: Cursor): S;
   serialize(cursor: Cursor, value: InternalValueType<T>): void;
}
export interface InternalValueTypeConstructor extends ValueTypeConstructor<InternalValueType<any>> {}
export const InternalValueType: InternalValueTypeConstructor = VALUE_TYPE_CONSTRUCTOR_FACTORY<any>(
   'InternalValueType',
   null,
) as any;

mergeSourceDirectNoEnumerable(InternalValueType, {
   deserialize: function deserialize(): void {
      throw new ReferenceError('No implementation error');
   },
   serialize: function serialize(): void {
      throw new ReferenceError('No implementation error');
   },
});
