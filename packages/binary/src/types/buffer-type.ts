import { mergeSourceDirectNoEnumerable, VALUE_TYPE_CONSTRUCTOR_FACTORY, ValueTypeConstructor } from './base';
import { InternalValueType, InternalValueTypeConstructor } from './internal-value-type';
import { SerializableType } from './serializable-type';

type Mutable<T> = { -readonly [k in keyof T]: T[k] };

const CACHED: Map<string, BufferTypeConstructor> = new Map();
function Buff(type: SerializableType<number>, ...params: unknown[]): BufferTypeConstructor {
   const id = type.getIdentifier(...(params as []));
   let v = CACHED.get(id);
   if (v) return v;

   v = VALUE_TYPE_CONSTRUCTOR_FACTORY<string>(
      `Buffer(${id ?? 'Unknown Number Type'})`,
      '',
      Buffer as unknown as ValueTypeConstructor<any>,
   ) as BufferTypeConstructor;
   (v as Mutable<BufferTypeConstructor>).type = type;
   (v as Mutable<BufferTypeConstructor>).typeParams = params;
   CACHED.set(id, v);
   return v;
}
export const Buffer: BufferConstructor = Buff as BufferConstructor;
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
export interface BufferTypeConstructor extends InternalValueTypeConstructor<BufferType, Uint8Array> {
   readonly type: SerializableType<number>;
   readonly typeParams: unknown[];
}
export interface BufferType extends InternalValueType<string> {}
{
   let type = Buffer as unknown as BufferTypeConstructor;
   mergeSourceDirectNoEnumerable(type, {
      getIdentifier() {
         return (this as unknown as new () => void).name;
      },
      deserialize(cursor) {
         const length = (this as BufferTypeConstructor).type!.deserialize(
               cursor,
               ...((this as BufferTypeConstructor).typeParams as []),
            ),
            $ = cursor.getSliceSpan(length);
         return ((cursor.pointer += $.length), $);
      },
      serialize(cursor, value) {
         (this as BufferTypeConstructor).type!.serialize(
            cursor,
            value.length,
            ...((this as BufferTypeConstructor).typeParams as []),
         );
         cursor.buffer.set(value, cursor.pointer);
         cursor.pointer += value.length;
      },
   });
}
