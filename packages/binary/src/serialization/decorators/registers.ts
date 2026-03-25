import { SerializableType } from '../base/serializable-type';
import { EncodingCompilable, PureCompilable } from '../compiler';
import { MetaProperty, Target } from '../compiler/meta';
import { AbstractType } from '../encoding/abstract-type';
import { ensureTarget } from './compilable';

export function ensureProperty(target: Target, property: string): MetaProperty {
   const meta = ensureTarget(target);
   let prop = meta.properties.get(property);
   if (!prop) meta.properties.set(property, (prop = new MetaProperty(property)));
   return prop;
}
/**
 * Assigns a serialization type to a property.
 */
export function SerializeAs<T extends SerializableType<unknown>>(
   type: T,
   ...params: T extends SerializableType<unknown, infer P> ? P : []
): (target: AbstractType, property: string) => void {
   return (target, property) => {
      const prop = ensureProperty((target as { constructor: Target }).constructor, property);
      prop.encoding = new PureCompilable(type, params);
   };
}

/**
 * Assigns a length encoding type to a property, making it an array.
 */
export function LengthEncodeAs<T extends SerializableType<number>>(
   type: T,
   ...params: T extends SerializableType<number, infer P> ? P : []
): (target: AbstractType, property: string) => void {
   return (target, property) => {
      const prop = ensureProperty((target as { constructor: Target }).constructor, property);
      prop.arrayOptions = new PureCompilable(type, params);
   };
}

/**
 * Assigns a variant serialization type to a property, where the type is chosen based on another property's value.
 */
export function Variant<T extends AbstractType, K extends keyof T>(
   key: K,
   map: Record<T[K] extends string | number ? T[K] : never, SerializableType<unknown>>
): (target: T, property: string) => void {
   return (target, property) => {
      const prop = ensureProperty((target as unknown as { constructor: Target }).constructor, property);
      prop.condition = ensureProperty(
         (target as unknown as { constructor: Target }).constructor,
         key as string
      );
      let keys: (string | number)[] = Object.getOwnPropertyNames(map);
      const numerical = keys.map(Number).filter(isFinite);
      if (keys.length === numerical.length) keys = numerical;
      const mapped = new Map<string | number, EncodingCompilable>();
      for (const key of keys) {
         mapped.set(
            key,
            new PureCompilable(
               (map as Record<string | number, SerializableType<unknown>>)[key as string | number],
               []
            )
         );
      }
      prop.variant = mapped;
   };
}

/**
 * Makes a property optional.
 */
export function Optional(target: AbstractType, property: string): void {
   const prop = ensureProperty((target as { constructor: Target }).constructor, property);
   prop.isOptional = true;
}

/**
 * Makes a property conditional based on another property's value.
 */
export function Conditional<T extends AbstractType>(
   key: keyof T,
   expression?: string | null
): (target: T, property: string) => void {
   return (target, property) => {
      const prop = ensureProperty((target as unknown as { constructor: Target }).constructor, property);
      prop.condition = ensureProperty(
         (target as unknown as { constructor: Target }).constructor,
         key as string
      );
      prop.expression = expression ?? null;
   };
}
