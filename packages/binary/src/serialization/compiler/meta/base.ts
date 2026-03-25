import { AbstractType } from '../../encoding';
import { AssignmentStrategy, Context, ContextStrategy } from '../context';
import { MetaProperty } from './property';

export type Target = new () => AbstractType;
export interface MetaCompilationResult {
   deserialize: string;
   serialize: string;
   context: Context;
   properties: [string, ContextStrategy][];
   strategy: ContextStrategy;
}
export abstract class MetaTarget {
   public target: Target;
   public readonly properties: Map<string, MetaProperty> = new Map();
   public constructor(target: Target) {
      this.target = target;
   }
   public abstract compile(): MetaCompilationResult;
}
export class MetaTargetCore extends MetaTarget {
   public override compile(): MetaCompilationResult {
      const context = Context.create();
      const raw = context.localRaw(ContextStrategy.common(context, AssignmentStrategy.Declare));
      const serializes: string[] = [];
      const deserializes: string[] = [];
      const properties: [string, ContextStrategy][] = [];
      for (const value of this.properties.values()) {
         const { deserialization, serialization, strategy } = value.compile(context);
         properties.push([value.name, strategy]);
         serializes.push(serialization);
         deserializes.push(deserialization);
      }
      return {
         serialize: serializes.join(';\n'),
         deserialize: deserializes.join(';\n'),
         context,
         properties,
         strategy: raw(),
      };
   }
}
