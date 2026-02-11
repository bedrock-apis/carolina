import {
   mergeSourceDirectNoEnumerable,
   VALUE_TYPE_CONSTRUCTOR_FACTORY,
   ValueType,
   ValueTypeConstructor,
} from './base';

export interface InternalValueType<T> extends ValueType<T> {}
export interface InternalValueTypeConstructor<
   T extends InternalValueType<unknown>,
   S,
> extends ValueTypeConstructor<T, S> {}
export const InternalValueType: InternalValueTypeConstructor<
   InternalValueType<unknown>,
   unknown
> = VALUE_TYPE_CONSTRUCTOR_FACTORY<unknown>('InternalValueType', null);

mergeSourceDirectNoEnumerable(InternalValueType, {
   deserialize: function deserialize(): void {
      throw new ReferenceError('No implementation error');
   },
   serialize: function serialize(): void {
      throw new ReferenceError('No implementation error');
   },
});
