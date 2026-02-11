import { Cursor, VarInt } from '@carolina/binary';

export class ImmediateCachedPackedFrame {}
export class Framer {
   public static *getFramesIterator(cursor: Cursor): Generator<Cursor> {
      while (!cursor.isEndOfStream) {
         // Zero buffer copy
         yield Cursor.create(cursor.getSliceSpan(VarInt.deserialize(cursor)));
      }
   }
}
