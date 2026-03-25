import { InjectAsNoEnumerableStruct } from '@carolina/common';

import { SerializableType } from '../../base';
import { EncodingCompilable, EncodingResults, OutputKind, PureCompilable } from '../../compiler';
import { AssignmentStrategy, Context, ContextStrategy } from '../../compiler/context';
import { VALUE_TYPE_CONSTRUCTOR_FACTORY, ValueTypeConstructor } from '../value-type';
import { NumberType } from './common-number-type';

export interface StaticSizedNumberConstructor<T extends number | bigint>
   extends ValueTypeConstructor<StaticSizedNumber<T>, T, [littleEndian?: boolean]>, EncodingCompilable {}
export interface StaticSizedNumber<T extends number | bigint> extends NumberType<T> {}
type DataViewMethodKey = {
   [K in keyof DataView]: K extends `${'set' | 'get'}${infer V}` ? V : never;
}[keyof DataView];

export function generateStaticTypeWithEndianness<T extends number | bigint, S extends DataViewMethodKey>(
   name: S,
   defaultValue: T,
   sizeOf: number
): StaticSizedNumberConstructor<T> {
   const $ = VALUE_TYPE_CONSTRUCTOR_FACTORY(name, defaultValue, NumberType);

   InjectAsNoEnumerableStruct(
      $,
      CreateSerializableFromCompilable({
         compile(context, endianness): EncodingResults {
            const [cursor] = context.environments;
            const { input } = context.getStrategy();
            return {
               deserialization: `${cursor}.view.get${name}(${cursor}.pointer,${endianness ?? true});${cursor}.pointer+=${sizeOf}`,
               serialization: `${cursor}.view.set${name}(${cursor}.pointer,${input},${endianness ?? true});${cursor}.pointer+=${sizeOf}`,
               kind: OutputKind.BareBone,
            };
         },
      } satisfies EncodingCompilable)
   );

   return $ as StaticSizedNumberConstructor<T>;
}

function CreateSerializableFromCompilable(
   compilable: EncodingCompilable
): EncodingCompilable & Omit<SerializableType<unknown>, 'getIdentifier'> {
   const ctx = Context.create();
   const raw = ctx.localRaw(new ContextStrategy('value', '_', AssignmentStrategy.Declare));
   const { serialization, deserialization } = new PureCompilable(compilable, ['endianness']).compile(ctx);
   const { input, result } = raw();
   const [cursor] = ctx.environments;
   return {
      serialize: new Function(
         [...ctx.environments][0]?.toString() as string,
         input.toString(),
         'endianness=true',
         `${serialization}`
      ),
      deserialize: new Function(String(cursor), 'endianness=true', `${deserialization};return ${result};`),
      ...compilable,
   } as EncodingCompilable & Omit<SerializableType<unknown>, 'getIdentifier'>;
}
