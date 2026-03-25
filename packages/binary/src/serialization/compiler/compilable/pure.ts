import { SerializableType } from '../../base';
import { Context } from '../context';
import { type EncodingCompilable, type EncodingResults, OutputKind } from './base';
import { CompilableUtils } from './utils';

export type Encodable = SerializableType<unknown> | EncodingCompilable;
export class PureCompilable implements EncodingCompilable {
   public encoding: Encodable;
   public options: unknown[];
   public constructor(encoding: Encodable, options: unknown[] = []) {
      this.encoding = encoding;
      this.options = options;
   }
   public compile(context: Context, ...params: unknown[]): EncodingResults {
      const [cursor] = context.environments;
      const strategy = context.getStrategy();
      if ('compile' in this.encoding)
         return CompilableUtils.toNormalized(this.encoding, context, ...this.options, ...params);

      const serializer = context.p(this.encoding);
      context.environments.add(serializer);
      return {
         serialization: `${serializer}.serialize(${[cursor, strategy.input, ...this.options, ...params].join(',')})`,
         deserialization: CompilableUtils.assignWithStrategy(
            strategy,
            `${serializer}.deserialize(${[cursor, ...this.options].join(',')})`
         ),
         kind: OutputKind.Normal,
      };
   }
}
