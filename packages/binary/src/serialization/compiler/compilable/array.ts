import { AssignmentStrategy, Context, type ContextLiteral, ContextStrategy } from '../context';
import { type EncodingCompilable, type EncodingResults, OutputKind } from './base';
import { CompilableUtils } from './utils';

export class ArrayCompilable implements EncodingCompilable {
   public lengthEncoding: EncodingCompilable;
   public elementEncoding: EncodingCompilable;
   public constructor(length: EncodingCompilable, element: EncodingCompilable) {
      this.lengthEncoding = length;
      this.elementEncoding = element;
   }
   public compile(context: Context, ...params: unknown[]): EncodingResults {
      const BASE_STRATEGY = context.getStrategy();

      const { strategy: lengthStrategy, ...lengthRaw } = CompilableUtils.with(
         ContextStrategy.common(context, AssignmentStrategy.Declare),
         this.lengthEncoding,
         context,
         ...params
      );

      //const compLen = this.lengthEncoding.compile(context, C_LENGTH, ...options);

      let HELPER: ContextLiteral = context.p();
      let DECLARATION;
      if (BASE_STRATEGY.resultStrategy === AssignmentStrategy.Assignment) {
         DECLARATION = `const ${HELPER}=${BASE_STRATEGY.result}=`;
      } else {
         HELPER = BASE_STRATEGY.result;
         DECLARATION = `const ${HELPER}=`;
      }

      const C_ELEMENT = context.p();

      const elementRaw = CompilableUtils.with(
         new ContextStrategy(C_ELEMENT, `${HELPER}[i]`, AssignmentStrategy.Assignment),
         this.elementEncoding,
         context,
         ...params
      );

      // --- Serialization Logic ---
      const serialization = `const ${lengthStrategy.input}=${BASE_STRATEGY.input}.length;
         ${lengthRaw.serialization};
         for(let i=0;i<${lengthStrategy.input};i++){
            const ${C_ELEMENT}=${BASE_STRATEGY.input}[i];
            ${elementRaw.serialization};
         }`;

      const deserialization = `${lengthRaw.deserialization};
         ${DECLARATION}new Array(${lengthStrategy.result});
         for(let i=0;i<${lengthStrategy.result};i++){
            ${elementRaw.deserialization};
         }`;

      return { serialization, deserialization, kind: OutputKind.Normal };
   }
}
