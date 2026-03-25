import { AbstractType, Cursor, VarString } from '@carolina/binary';

/**
 * Represents a resource pack requested by the client.
 * Serialized as a string in the format "uuid_version".
 */
export class RequestedResourcePack extends AbstractType {
   public constructor(
      public uuid: string,
      public version: string
   ) {
      super();
   }

   public static override serialize<T extends AbstractType>(
      this: new (...args: unknown[]) => T,
      cursor: Cursor,
      value: T
   ): void {
      const pack = value as unknown as RequestedResourcePack;
      VarString.serialize(cursor, `${pack.uuid}_${pack.version}`);
   }

   public static override deserialize<T extends AbstractType>(
      this: new (...args: unknown[]) => T,
      cursor: Cursor
   ): T {
      const entry = VarString.deserialize(cursor);
      const [uuid, version] = entry.split('_');
      return new this(uuid ?? '', version ?? '') as T;
   }
}
