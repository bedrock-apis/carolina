import { InjectAsNoEnumerableStruct } from '@carolina/common';

import { SerializableType } from '../../base';
import { VALUE_TYPE_CONSTRUCTOR_FACTORY, ValueType, ValueTypeConstructor } from '../value-type';

type Mutable<T> = { -readonly [k in keyof T]: T[k] };

const CACHED: Map<string, StringTypeConstructor> = new Map();

export const String: StringConstructor = function StringFunction(
   type: SerializableType<number>,
   ...params: unknown[]
): StringTypeConstructor {
   const id = type.getIdentifier(...(params as []));
   const UNIQUE_IDENTITY = id + JSON.stringify(params);
   let v = CACHED.get(UNIQUE_IDENTITY);
   if (v) return v;

   v = VALUE_TYPE_CONSTRUCTOR_FACTORY<string>(
      `StringType(${id ?? 'Unknown Number Type'})`,
      '',
      StringFunction as unknown as ValueTypeConstructor<ValueType<string>, unknown, []>
   ) as unknown as StringTypeConstructor;
   (v as Mutable<StringTypeConstructor>).type = type;
   (v as Mutable<StringTypeConstructor>).typeParams = params;
   CACHED.set(UNIQUE_IDENTITY, v);
   return v;
} as StringConstructor;
export interface StringConstructor {
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
export interface StringTypeConstructor extends ValueTypeConstructor<StringType, string> {
   readonly type: SerializableType<number>;
   readonly typeParams: unknown[];
}
export interface StringType extends ValueType<string> {}
{
   const decoder = new TextDecoder();
   const encoder = new TextEncoder();
   const type = String as unknown as StringTypeConstructor;
   InjectAsNoEnumerableStruct(type, {
      deserialize(cursor) {
         const length = (this as StringTypeConstructor).type.deserialize(
               cursor,
               ...((this as StringTypeConstructor).typeParams as [])
            ),
            $ = cursor.getSliceSpan(length);
         return ((cursor.pointer += $.length), decoder.decode($));
      },
      serialize(cursor, value) {
         const buffer = encoder.encode(value);
         (this as StringTypeConstructor).type.serialize(
            cursor,
            buffer.length,
            ...((this as StringTypeConstructor).typeParams as [])
         );
         cursor.buffer.set(buffer, cursor.pointer);
         cursor.pointer += buffer.length;
      },
   });
}
