import { SerializableType } from './serializable-type';

export interface ValueTypeConstructor<T extends ValueType<any>, S = unknown, P extends unknown[] = []>
   extends SerializableType<S, P> {
   new (): T;
   readonly prototype: T;
   readonly name: string;
}
export interface ValueType<T> {
   value: T;
   valueOf(): T;
   readonly constructor: ValueTypeConstructor<this>;
}

const { create, setPrototypeOf, defineProperty, defineProperties, getOwnPropertyDescriptors, getPrototypeOf } = Object;

export const VALUE_TYPE_CONSTRUCTOR_FACTORY: <T>(
   name: string,
   $: T,
   base?: ValueTypeConstructor<ValueType<T>>
) => ValueTypeConstructor<ValueType<T>> = <T>(name: string, $: T, base?: ValueTypeConstructor<ValueType<T>>) => {
   function typedValue(this: ValueType<T>, _: T): ValueType<T> {
      const value = this ?? create(prototype);
      value.value = _ ?? $;
      return value;
   }
   const { prototype } = typedValue;
   if (base) {
      setPrototypeOf(typedValue, base);
      setPrototypeOf(prototype, /*SHARED_PROTOTYPE*/ base.prototype);
   }
   defineProperty(typedValue, 'name', { configurable: true, enumerable: false, writable: false, value: name });
   mergeSourceDirectNoEnumerable(typedValue, {
      getIdentifier() {
         return (this as unknown as { name: string }).name;
      },
   });
   return typedValue as unknown as ValueTypeConstructor<ValueType<T>>;
};

export function mergeSourceWithInheritance<T, S extends Partial<T>>(target: T, source: S): T & S {
   return defineProperties(
      target,
      getOwnPropertyDescriptors(
         setPrototypeOf(source, create(getPrototypeOf(target), getOwnPropertyDescriptors(target)))
      )
   ) as T & S;
}
export function mergeSourceDirectNoEnumerable<T, S extends Partial<T>>(target: T, source: S): T & S {
   const raw = getOwnPropertyDescriptors(source);
   for (const key of Reflect.ownKeys(raw)) raw[key as keyof typeof raw].enumerable = false;
   return defineProperties(target, raw) as T & S;
}
