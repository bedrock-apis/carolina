import {
   ArrayCompilable,
   ConditionalCompilable,
   HardcodedOptionalCompilable,
   VariantSwitchCompilable,
} from '../compilable';
import { type EncodingCompilable, type EncodingResults } from '../compilable/base';
import { AssignmentStrategy, ContextStrategy, type Context } from '../context';

export class MetaProperty implements EncodingCompilable {
   public readonly name: string;
   public isOptional: boolean = false;
   public encoding: EncodingCompilable | null = null;
   public arrayOptions: EncodingCompilable | null = null;
   public condition: MetaProperty | null = null;
   public expression: string | null = null;
   public variant: Map<string | number, EncodingCompilable> | null = null;
   public constructor(name: string) {
      this.name = name;
   }
   public compile(context: Context, ...params: unknown[]): EncodingResults & { strategy: ContextStrategy } {
      let encoding = this.encoding;
      const { input } = context.getStrategy();
      code: {
         if (this.condition && this.variant) {
            encoding = new VariantSwitchCompilable(
               new ContextStrategy(`${input}.${this.condition.name}`, context.p(this.condition)),
               this.variant
            );
            break code;
         }
         if (!encoding) throw new ReferenceError("Can't compile without encoding information");
         if (this.arrayOptions) {
            encoding = new ArrayCompilable(this.arrayOptions, encoding);
         }
         if (this.isOptional) encoding = new HardcodedOptionalCompilable(encoding);
         if (this.condition && !this.variant) {
            context.variables.set(this.condition.name, context.p(this.condition));
            encoding = new ConditionalCompilable(
               encoding,
               new ContextStrategy(`${input}.${this.condition.name}`, context.p(this.condition)),
               this.expression
            );
         }
      }

      const p = context.p(this);
      const local = context.localRaw(
         new ContextStrategy(`${input}.${this.name}`, p, AssignmentStrategy.Declare)
      );
      const results = encoding.compile(context, ...params);
      const result = local();
      return { ...results, strategy: result };
   }
}
