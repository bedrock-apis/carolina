import { SerializableType } from '../base';
import { AbstractType } from './abstract-type';

export interface ValueTypeConstructor<
   T extends ValueType<unknown>,
   S = unknown,
   P extends unknown[] = [],
> extends SerializableType<S, P> {
   new (): T;
   readonly prototype: T;
   readonly name: string;
}
export interface ValueType<T> {
   value: T;
   valueOf(): T;
   readonly constructor: ValueTypeConstructor<this>;
}

const { create, setPrototypeOf, defineProperty } = Object;

export const VALUE_TYPE_CONSTRUCTOR_FACTORY: <T>(
   name: string,
   $: T,
   base?: ValueTypeConstructor<ValueType<T>>
) => ValueTypeConstructor<ValueType<T>> = <T>(
   name: string,
   $: T,
   base?: ValueTypeConstructor<ValueType<T>>
) => {
   function TypedValueConstructor(this: ValueType<T>, _: T): ValueType<T> {
      const value = this ?? create(prototype);
      value.value = _ ?? $;
      return value;
   }
   const { prototype } = TypedValueConstructor;
   (base as unknown) ??= AbstractType;
   setPrototypeOf(TypedValueConstructor, base as object);
   setPrototypeOf(prototype, /*SHARED_PROTOTYPE*/ (base as { prototype: object }).prototype);
   defineProperty(TypedValueConstructor, 'name', {
      configurable: true,
      enumerable: false,
      writable: false,
      value: name,
   });
   return TypedValueConstructor as unknown as ValueTypeConstructor<ValueType<T>>;
};
