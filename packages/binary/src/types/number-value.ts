import { VALUE_TYPE_CONSTRUCTOR_FACTORY, ValueType, ValueTypeConstructor } from "./base";

export interface NumberType extends ValueType<number> {};
export const NumberType: ValueTypeConstructor<NumberType> = VALUE_TYPE_CONSTRUCTOR_FACTORY("NumberType", 0);