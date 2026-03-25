import { InjectAsNoEnumerableStruct } from '@carolina/common';

import { SerializableType } from '../../base';
import { VALUE_TYPE_CONSTRUCTOR_FACTORY, ValueType, ValueTypeConstructor } from '../value-type';

type Mutable<T> = { -readonly [k in keyof T]: T[k] };

const CACHED: Map<string, BufferTypeConstructor> = new Map();

export const Buffer: BufferConstructor = function Buffer(
   type: SerializableType<number>,
   ...params: unknown[]
): BufferTypeConstructor {
   const id = type.getIdentifier(...(params as []));
   const UNIQUE_IDENTITY = id + JSON.stringify(params);
   let v = CACHED.get(UNIQUE_IDENTITY);
   if (v) return v;

   v = VALUE_TYPE_CONSTRUCTOR_FACTORY<Uint8Array>(
      `Buffer(${id ?? 'Unknown Number Type'})`,
      new Uint8Array(0),
      Buffer as unknown as ValueTypeConstructor<ValueType<Uint8Array>, unknown, []>
   ) as unknown as BufferTypeConstructor;
   (v as Mutable<BufferTypeConstructor>).type = type;
   (v as Mutable<BufferTypeConstructor>).typeParams = params;
   CACHED.set(UNIQUE_IDENTITY, v);
   return v;
} as BufferConstructor;
export interface BufferConstructor {
   new <T extends SerializableType<number>>(
      type: T,
      ...params: T extends SerializableType<number, infer P> ? P : []
   ): BufferTypeConstructor;
   <T extends SerializableType<number>>(
      type: T,
      ...params: T extends SerializableType<number, infer P> ? P : []
   ): BufferTypeConstructor;
   readonly prototype: BufferTypeConstructor;
   readonly name: string;
}
export interface BufferTypeConstructor extends ValueTypeConstructor<BufferType, Uint8Array> {
   readonly type: SerializableType<number>;
   readonly typeParams: unknown[];
}
export interface BufferType extends ValueType<Uint8Array> {}
{
   const type = Buffer as unknown as BufferTypeConstructor;
   InjectAsNoEnumerableStruct(type, {
      getIdentifier() {
         return (this as unknown as new () => void).name;
      },
      deserialize(cursor) {
         const length = (this as BufferTypeConstructor).type.deserialize(
               cursor,
               ...((this as BufferTypeConstructor).typeParams as [])
            ),
            $ = cursor.getSliceSpan(length);
         return ((cursor.pointer += $.length), $);
      },
      serialize(cursor, value) {
         (this as BufferTypeConstructor).type.serialize(
            cursor,
            value.length,
            ...((this as BufferTypeConstructor).typeParams as [])
         );
         cursor.buffer.set(value, cursor.pointer);
         cursor.pointer += value.length;
      },
   });
}
