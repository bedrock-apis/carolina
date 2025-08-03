import { mergeSourceDirectNoEnumerable, VALUE_TYPE_CONSTRUCTOR_FACTORY, ValueType, ValueTypeConstructor } from "./base";

export interface BaseType<T> extends ValueType<T> { };
export const BaseType: ValueTypeConstructor<BaseType<any>> = VALUE_TYPE_CONSTRUCTOR_FACTORY("BaseType", 0);

mergeSourceDirectNoEnumerable(BaseType, {
    deserialize: function deserialize(): void { throw new ReferenceError("No implementation error"); },
    serialize: function serialize(): void { throw new ReferenceError("No implementation error"); }
});