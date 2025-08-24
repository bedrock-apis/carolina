import { mergeSourceDirectNoEnumerable, VALUE_TYPE_CONSTRUCTOR_FACTORY, ValueTypeConstructor } from './base';
import { InternalValueType, InternalValueTypeConstructor } from './internal-value-type';
import { SerializableType } from './serializable-type';

type Mutable<T> = { -readonly [k in keyof T]: T[k] };

const CACHED: Map<string, StringTypeConstructor> = new Map();
function String(type: SerializableType<number>, ...params: unknown[]): StringTypeConstructor {
   const id = type.getIdentifier(...(params as []));
   let v = CACHED.get(id);
   if (v) return v;

   v = VALUE_TYPE_CONSTRUCTOR_FACTORY<string>(
      `StringType(${id ?? 'Unknown Number Type'})`,
      '',
      String as unknown as ValueTypeConstructor<any>,
   ) as StringTypeConstructor;
   (v as Mutable<StringTypeConstructor>).type = type;
   (v as Mutable<StringTypeConstructor>).typeParams = params;
   CACHED.set(id, v);
   return v;
}
export const Str: StrConstructor = String as StrConstructor;
export interface StrConstructor {
   new <T extends SerializableType<number>>(
      type: T,
      ...params: T extends SerializableType<number, infer P> ? P : []
   ): StringTypeConstructor;
   <T extends SerializableType<number>>(
      type: T,
      ...params: T extends SerializableType<number, infer P> ? P : []
   ): StringTypeConstructor;
   readonly prototype: StringTypeConstructor;
   readonly name: string;
}
export interface StringTypeConstructor extends InternalValueTypeConstructor<StringType, string> {
   readonly type: SerializableType<number>;
   readonly typeParams: unknown[];
}
export interface StringType extends InternalValueType<string> {}
{
   const decoder = new TextDecoder();
   const encoder = new TextEncoder();
   let type = String as unknown as StringTypeConstructor;
   mergeSourceDirectNoEnumerable(type, {
      getIdentifier() {
         return (this as unknown as new () => void).name;
      },
      deserialize(cursor) {
         const length = (this as StringTypeConstructor).type!.deserialize(
               cursor,
               ...((this as StringTypeConstructor).typeParams as []),
            ),
            $ = cursor.getSliceSpan(length);
         return ((cursor.pointer += $.length), decoder.decode($));
      },
      serialize(cursor, value) {
         const buffer = encoder.encode(value);
         (this as StringTypeConstructor).type!.serialize(
            cursor,
            buffer.length,
            ...((this as StringTypeConstructor).typeParams as []),
         );
         cursor.buffer.set(buffer, cursor.pointer);
         cursor.pointer += buffer.length;
      },
   });
}
