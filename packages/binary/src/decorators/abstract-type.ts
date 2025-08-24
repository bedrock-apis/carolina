import { Cursor } from '../cursor';
import { SerializableType } from '../types';

export abstract class AbstractType {
   public static deserialize<T extends AbstractType>(this: new () => T, cursor: Cursor): T {
      throw new ReferenceError("This type wasn't compiled, so deserialize method doesn't exists");
   }
   public static serialize<T extends AbstractType>(this: new () => T, cursor: Cursor, value: T): void {
      throw new ReferenceError("This type wasn't compiled, so deserialize method doesn't exists");
   }
   public static getIdentifier(this: new () => AbstractType): string {
      return this.name;
   }
}
// Type check
AbstractType satisfies SerializableType<unknown>;
