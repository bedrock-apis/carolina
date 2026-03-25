import { Cursor, VarInt32 } from '@carolina/binary';

export class Framer {
   public static *getFramesIterator(cursor: Cursor): Generator<Cursor> {
      while (!cursor.isEndOfStream) {
         const frameSize = VarInt32.deserialize(cursor);
         // Zero buffer copy
         const message = cursor.getSliceSpan(frameSize);
         cursor.pointer += frameSize;
         yield Cursor.create(message);
      }
   }
}
