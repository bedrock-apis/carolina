const { create, getPrototypeOf, getOwnPropertyDescriptors, defineProperties, setPrototypeOf } = Object;
export function ObjectOverTakesJS<T, S extends Partial<T>>(target: T, source: S): T & S {
   const clone = create(getPrototypeOf(target), getOwnPropertyDescriptors(target));
   setPrototypeOf(source, clone);
   defineProperties(target, getOwnPropertyDescriptors(source));
   return clone;
}

function _mergeSourceWithInheritance<T, S extends Partial<T>>(target: T, source: S): T & S {
   return defineProperties(
      target,
      getOwnPropertyDescriptors(
         setPrototypeOf(source, create(getPrototypeOf(target), getOwnPropertyDescriptors(target)))
      )
   ) as T & S;
}
export function InjectAsNoEnumerableStruct<T, S extends Partial<T>>(target: T, source: S): T & S {
   const raw = getOwnPropertyDescriptors(source);
   for (const key of Reflect.ownKeys(raw)) raw[key as keyof typeof raw].enumerable = false;
   return defineProperties(target, raw) as T & S;
}
