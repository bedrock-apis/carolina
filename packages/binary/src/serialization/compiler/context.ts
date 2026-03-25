export enum AssignmentStrategy {
   Declare,
   Assignment,
}

export type ContextLiteral = ContextProperty | string;
export type ContextLiteralValue = ContextLiteral | number | boolean | null;
export class ContextStrategy {
   public static common(context: Context, strategy: AssignmentStrategy): ContextStrategy {
      const p = context.p();
      const str = new this(p, p, strategy);
      return str;
   }
   public readonly input: ContextLiteral;
   public readonly result: ContextLiteral;
   public resultStrategy: AssignmentStrategy;
   public constructor(
      input: ContextLiteral,
      result: ContextLiteral,
      resultStrategy: AssignmentStrategy = AssignmentStrategy.Declare
   ) {
      this.input = input;
      this.result = result;
      this.resultStrategy = resultStrategy;
   }
}
export class Context {
   protected _internal: number = 0;
   protected readonly properties: Map<unknown, ContextProperty> = new Map();
   public readonly environments: Set<ContextLiteralValue> = new Set();
   public readonly variables: Map<string, ContextLiteralValue> = new Map();
   protected readonly stack: ContextStrategy[] = [];
   public getStrategy(): ContextStrategy {
      return this.stack[this.stack.length - 1];
   }
   public localRaw(strategy: ContextStrategy): () => ContextStrategy {
      this.stack.push(strategy);
      return () => {
         const v = this.stack.pop();
         if (!v) throw new ReferenceError("Can't pup undeclared context strategy");
         return v;
      };
   }
   public local(
      input: ContextLiteral = this.p(),
      result: ContextLiteral = this.p(),
      resultStrategy: AssignmentStrategy = AssignmentStrategy.Assignment
   ): ReturnType<this['localRaw']> {
      return this.localRaw(new ContextStrategy(input, result, resultStrategy)) as ReturnType<
         this['localRaw']
      >;
   }
   public p(value: unknown = Symbol()): ContextProperty {
      let property = this.properties.get(value);
      if (property) return property;
      this.properties.set(
         value,
         (property = new ContextProperty(`$${(this._internal++).toString(32).padStart(2, '0')}`, value))
      );
      return property;
   }
   public static create(): Context {
      const ctx = new this();
      ctx.localRaw(ContextStrategy.common(ctx, AssignmentStrategy.Declare));
      ctx.environments.add(ctx.p());
      return ctx;
   }
}

export class ContextProperty {
   public readonly value: unknown | null;
   public readonly name: string;
   /**@internal */
   public constructor(name: string, value: unknown | null) {
      this.name = name;
      this.value = value;
   }
   public toString(): string {
      return this.name;
   }
   public valueOf(): unknown | null {
      return this.value;
   }
}
