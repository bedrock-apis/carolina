import { mergeSourceDirectNoEnumerable, VALUE_TYPE_CONSTRUCTOR_FACTORY, ValueType, ValueTypeConstructor } from './base';

export interface InternalValueType<T> extends ValueType<T> {}
export interface InternalValueTypeConstructor<T extends InternalValueType<any>, S> extends ValueTypeConstructor<T, S> {}
export const InternalValueType: InternalValueTypeConstructor<
   InternalValueType<any>,
   any
> = VALUE_TYPE_CONSTRUCTOR_FACTORY<any>('InternalValueType', null) as any;

mergeSourceDirectNoEnumerable(InternalValueType, {
   deserialize: function deserialize(): void {
      throw new ReferenceError('No implementation error');
   },
   serialize: function serialize(): void {
      throw new ReferenceError('No implementation error');
   },
});
