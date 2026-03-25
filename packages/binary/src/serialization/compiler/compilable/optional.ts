import { AssignmentStrategy, Context, ContextStrategy } from '../context';
import { EncodingCompilable, EncodingResults, OutputKind } from './base';
import { CompilableUtils } from './utils';

export class HardcodedOptionalCompilable implements EncodingCompilable {
   public encoding: EncodingCompilable;
   public constructor(encodingCompilable: EncodingCompilable) {
      this.encoding = encodingCompilable;
   }
   public compile(context: Context, ...params: unknown[]): EncodingResults {
      const BASE_STRATEGY = context.getStrategy();
      const [cursor] = context.environments;
      const info = CompilableUtils.with(
         new ContextStrategy(BASE_STRATEGY.input, BASE_STRATEGY.result, AssignmentStrategy.Assignment),
         this.encoding,
         context,
         ...params
      );

      return {
         serialization: `if(${BASE_STRATEGY.input}!=null){
            ${cursor}.view.setUint8(${cursor}.pointer++, 1);
            ${info.serialization};
         } else ${cursor}.view.setUint8(${cursor}.pointer++, 0)`,
         deserialization: `${BASE_STRATEGY.resultStrategy === AssignmentStrategy.Declare ? `let ${BASE_STRATEGY.result}=null;` : ''}
            if(${cursor}.view.getUint8(${cursor}.pointer++)!==0){
               ${info.deserialization};
            }`,
         kind: OutputKind.Normal,
      };
   }
}
