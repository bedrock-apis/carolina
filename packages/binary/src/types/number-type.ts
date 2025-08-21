import { VALUE_TYPE_CONSTRUCTOR_FACTORY, ValueTypeConstructor } from './base';
import { InternalValueType } from './internal-value-type';

export interface NumberType<T extends number | bigint> extends InternalValueType<T> {}
export const NumberType: ValueTypeConstructor<NumberType<number | bigint>> = VALUE_TYPE_CONSTRUCTOR_FACTORY(
   'NumberType',
   0,
);
