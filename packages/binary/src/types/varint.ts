import { VALUE_TYPE_CONSTRUCTOR_FACTORY, ValueTypeConstructor } from "./base";
import { NumberType } from "./number-value";

//NOTE - Proof of concept
export const VarInt: ValueTypeConstructor<VarInt> = VALUE_TYPE_CONSTRUCTOR_FACTORY("VarInt", 0, NumberType) as ValueTypeConstructor<VarInt>;
export interface VarInt extends NumberType{}