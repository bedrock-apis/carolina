import { VALUE_TYPE_CONSTRUCTOR_FACTORY, ValueType, ValueTypeConstructor } from '../value-type';

export interface NumberType<T extends number | bigint> extends ValueType<T> {}
export interface NumberTypeConstructor<T extends number | bigint> extends ValueTypeConstructor<
   NumberType<T>,
   T
> {}
export const NumberType: ValueTypeConstructor<
   NumberType<number | bigint>,
   number | bigint
> = VALUE_TYPE_CONSTRUCTOR_FACTORY<number | bigint>('NumberType', 0) as ValueTypeConstructor<
   NumberType<number | bigint>,
   number | bigint
>;
