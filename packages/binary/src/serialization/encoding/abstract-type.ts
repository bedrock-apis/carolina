// oxlint-disable no-unused-vars
import { Cursor } from '../../cursor';
import { SerializableType } from '../base/serializable-type';

export abstract class AbstractType {
   public static deserialize<T extends AbstractType>(this: new () => T, cursor: Cursor): T {
      throw new ReferenceError(
         "This type is abstract and doesn't has deserialization method. Forgot the compile decorator?"
      );
   }
   public static serialize<T extends AbstractType>(this: new () => T, cursor: Cursor, value: T): void {
      throw new ReferenceError(
         "This type is abstract and doesn't has serialization method. Forgot the compile decorator?"
      );
   }
   public static getIdentifier(this: new () => AbstractType): string {
      return this.name;
   }
}

AbstractType satisfies SerializableType<unknown>;
