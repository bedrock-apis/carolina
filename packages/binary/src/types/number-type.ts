import { VALUE_TYPE_CONSTRUCTOR_FACTORY } from './base';
import { InternalValueType, InternalValueTypeConstructor } from './internal-value-type';

export interface NumberType<T extends number | bigint> extends InternalValueType<T> {}
export interface NumberTypeConstructor<T extends number | bigint>
   extends InternalValueTypeConstructor<NumberType<T>, T> {}
export const NumberType: InternalValueTypeConstructor<
   NumberType<number | bigint>,
   number | bigint
> = VALUE_TYPE_CONSTRUCTOR_FACTORY<number | bigint>('NumberType', 0) as InternalValueTypeConstructor<
   NumberType<number | bigint>,
   number | bigint
>;
