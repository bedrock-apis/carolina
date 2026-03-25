import { AssignmentStrategy, Context, ContextStrategy } from '../context';
import { type EncodingCompilable, type EncodingResults, OutputKind } from './base';
import { CompilableUtils } from './utils';

export class VariantSwitchCompilable implements EncodingCompilable {
   public encoding_map: Map<string | number, EncodingCompilable> = new Map();
   public condition: ContextStrategy;

   public constructor(condition: ContextStrategy, map: Map<string | number, EncodingCompilable> = new Map()) {
      this.condition = condition;
      this.encoding_map = map;
   }

   public compile(context: Context, ...params: unknown[]): EncodingResults {
      const BASE_STRATEGY = context.getStrategy();

      let serialization = `switch(${this.condition.input}){`;
      let deserialization = `${BASE_STRATEGY.resultStrategy === AssignmentStrategy.Declare ? `let ${BASE_STRATEGY.result}=null;` : ''}
         switch(${this.condition.result}){`;

      for (const [key, encoding] of this.encoding_map) {
         const keyStr = JSON.stringify(key);
         const info = CompilableUtils.with(
            new ContextStrategy(BASE_STRATEGY.input, BASE_STRATEGY.result, AssignmentStrategy.Assignment),
            encoding,
            context,
            ...params
         );
         serialization += `case ${keyStr}:{
            ${info.serialization};
            break;
         }`;
         deserialization += `case ${keyStr}:{
            ${info.deserialization};
            break;
         }`;
      }

      serialization += `}`;
      deserialization += `}`;

      return { serialization, deserialization, kind: OutputKind.Normal };
   }
}
