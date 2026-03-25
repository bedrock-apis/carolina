import { AssignmentStrategy, Context, ContextStrategy } from '../context';
import { type EncodingCompilable, type EncodingResults, OutputKind } from './base';
import { CompilableUtils } from './utils';

export type ValidOperators = '===' | '==' | '<=' | '>=' | '>' | '<' | '||' | '&&' | '!==' | '!=';
export class ConditionalCompilable implements EncodingCompilable {
   public encoding: EncodingCompilable;
   public condition: ContextStrategy;
   public expression: string | null;
   public defaultValue: unknown = null;
   public constructor(
      encodingCompilable: EncodingCompilable,
      condition: ContextStrategy,
      expression: string | null,
      defaultValue: unknown = null
   ) {
      this.encoding = encodingCompilable;
      this.condition = condition;
      this.expression = expression;
      this.defaultValue = defaultValue;
   }
   public compile(context: Context, ...params: unknown[]): EncodingResults {
      const BASE_STRATEGY = context.getStrategy();
      const info = CompilableUtils.with(
         new ContextStrategy(BASE_STRATEGY.input, BASE_STRATEGY.result, AssignmentStrategy.Assignment),
         this.encoding,
         context,
         ...params
      );
      return {
         serialization: `if(${this.expression?.replaceAll('$', String(this.condition.input)) ?? String(this.condition.input)}){
            ${info.serialization};
         }`,
         deserialization: `${BASE_STRATEGY.resultStrategy === AssignmentStrategy.Declare ? `let ${BASE_STRATEGY.result}=${this.defaultValue};` : ''}
            if(${this.expression?.replaceAll('$', String(this.condition.result)) ?? String(this.condition.result)}){
               ${info.deserialization};
            }`,
         kind: OutputKind.Normal,
      };
   }
}
