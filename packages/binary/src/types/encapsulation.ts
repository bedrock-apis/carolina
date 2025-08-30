import { Cursor } from '../cursor';
import { SerializableType } from './serializable-type';

export class Encapsulation {
   public static decapsulate<T, S extends unknown[]>(
      cursor: Cursor,
      type: SerializableType<number, S>,
      handler: (cursor: Cursor) => T,
      ...params: S
   ): T {
      return handler(cursor.getEncapsulation(type.deserialize(cursor, ...params)));
   }
   /**
    * @deprecated It's not deprecated just keep in mind it does create new buffer and does copies
    */
   public static encapsulate<T, S extends unknown[]>(
      cursor: Cursor,
      type: SerializableType<number, S>,
      handler: (cursor: Cursor) => T,
      temporal: Cursor | null,
      ...params: S
   ): T {
      temporal ??= Cursor.create(new Uint8Array(cursor.availableSize + 10));
      temporal.reset();
      const $ = handler(temporal);
      const buf = cursor.getProcessedBytes();
      type.serialize(cursor, buf.length, ...params);
      cursor.writeSliceSpan(buf);
      return $;
   }
}
