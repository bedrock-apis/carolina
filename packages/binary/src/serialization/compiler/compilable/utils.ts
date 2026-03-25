import { AssignmentStrategy, Context, ContextLiteralValue, ContextStrategy } from '../context';
import { type EncodingCompilable, type EncodingResults, OutputKind } from './base';

export type Constructable = new (...params: unknown[]) => object;
const STRIP_REGEX = /\n */g;
export class CompilableUtils {
   public static toNormalized(
      encoding: EncodingCompilable,
      context: Context,
      ...params: unknown[]
   ): EncodingResults {
      const strategy = context.getStrategy();
      const result = encoding.compile(context, ...params);
      if (result.kind !== OutputKind.BareBone) return result;
      switch (strategy.resultStrategy) {
         case AssignmentStrategy.Assignment:
         case AssignmentStrategy.Declare:
            return {
               serialization: result.serialization,
               deserialization: CompilableUtils.assignWithStrategy(strategy, result.deserialization),
               kind: OutputKind.Normal,
            };
         default:
            throw new ReferenceError(
               "Undefined behavior can't normalized unknown assignment strategy: " + strategy
            );
      }
   }
   public static toDeclared(
      encoding: EncodingCompilable,
      context: Context,
      ...params: unknown[]
   ): EncodingResults {
      const strategy = context.getStrategy();
      strategy.resultStrategy = AssignmentStrategy.Declare;
      return CompilableUtils.toNormalized(encoding, context, ...params);
   }
   public static assignWithStrategy(
      { result, resultStrategy }: ContextStrategy,
      deserializationExpression: string
   ): string {
      return `${resultStrategy === AssignmentStrategy.Declare ? 'const ' : ''}${result}=${deserializationExpression}`;
   }
   public static with(
      strategy: ContextStrategy,
      encoding: EncodingCompilable,
      context: Context,
      ...params: unknown[]
   ): EncodingResults & { strategy: ContextStrategy } {
      const ref = context.localRaw(strategy);
      const result = CompilableUtils.toNormalized(encoding, context, ...params);
      return { ...result, strategy: ref() };
   }
   public static createConstructor(keys: string[], prototype: object): Constructable {
      const f = new Function(
         ...keys.map((e, i) => `$${i}`),
         keys.map((e, i) => `this.${e}=$${i};`).join('')
      ) as Constructable;
      f.prototype = prototype;
      return f;
   }
   public static createObjectLiteral(entries: [string, ContextLiteralValue][]): string {
      return `{${entries.map(([key, value]) => `${key}:${value}`).join(',')}}`;
   }
   public static strip<T extends { serialize: string; deserialize: string }>(code: T): T {
      code.serialize = code.serialize.replace(STRIP_REGEX, '');
      code.deserialize = code.deserialize.replace(STRIP_REGEX, '');
      return code;
   }
}
