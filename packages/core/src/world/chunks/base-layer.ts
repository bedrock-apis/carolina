import { Cursor, VarInt32, ZigZag32 } from '@carolina/binary';

const GET_INDEX_OPTIMIZED = (x: number, y: number, z: number): number =>
   ((x & 0xf) << 8) | ((z & 0xf) << 4) | (y & 0xf);

export class BaseLayer {
   public static readonly CUBIC_SIZE = 4096; // 16 ** 3;
   public readonly entries: Uint8Array = new Uint8Array(BaseLayer.CUBIC_SIZE);
   public readonly palette: Array<number> = new Array();
   public static readonly getIndex = GET_INDEX_OPTIMIZED;
   public static serialize(cursor: Cursor, layer: BaseLayer): void {
      // Calculate bits per block based on the palette size
      let bitsPerEntry = Math.ceil(Math.log2(layer.palette.length));
      if (bitsPerEntry > 6 && bitsPerEntry <= 8) bitsPerEntry = 8;
      else if (bitsPerEntry > 8) bitsPerEntry = 16;

      // Write the bits per block and flag
      // The flags tells that we wan't to use the new palette format with bit array compounding
      // 0 would tell the mc to use raw block runtimeIds
      cursor.writeUint8((bitsPerEntry << 1) | 1);

      // Special case if the layer is basically of one palette type
      // so we don't need to send anything other than just the one type, and still being able to reconstruct whole
      if (bitsPerEntry === 0) {
         ZigZag32.serialize(cursor, layer.palette.length);
         ZigZag32.serialize(cursor, layer.palette[0]);
         return;
      }

      // Calculate block and word sizes
      const blocksPerWord = Math.floor(32 / bitsPerEntry);
      const wordCount = Math.ceil(4096 / blocksPerWord);
      const entries = layer.entries;
      const dataview = cursor.view;
      const offset = cursor.pointer;

      // Serialize them, little endian
      for (let wordIndex = 0, entryIndex = 0, word = 0; wordIndex < wordCount; wordIndex++, word = 0) {
         for (let i = 0; i < blocksPerWord && entryIndex < BaseLayer.CUBIC_SIZE; i++, entryIndex++)
            // Write the block state to the word
            word |= entries[entryIndex] << (i * bitsPerEntry);
         dataview.setUint32(offset + (wordIndex << 2), word, true);
      }
      cursor.pointer = offset + (wordCount << 2);

      // Write size of the palette
      ZigZag32.serialize(cursor, layer.palette.length);
      for (let i = 0; i < layer.palette.length; i++)
         // Using runtime ids is much better for performance than hashes
         ZigZag32.serialize(cursor, layer.palette[i]);
   }
   public static deserialize(cursor: Cursor): BaseLayer {
      const layer = new BaseLayer();

      const header = cursor.readUint8();
      // bit 0 is the boolean flag, remaining 7 bits are bitsPerEntry
      const bitsPerEntry = header >> 1;

      if (bitsPerEntry === 0) {
         layer.palette.length = ZigZag32.deserialize(cursor);
         layer.palette[0] = ZigZag32.deserialize(cursor);
         return layer;
      }
      const blocksPerWord = Math.floor(32 / bitsPerEntry);
      const wordCount = Math.ceil(4096 / blocksPerWord);
      const dataview = cursor.view;
      const offset = cursor.pointer;

      const entries = layer.entries;
      const mask = (1 << bitsPerEntry) - 1;

      for (let wordIndex = 0, entryIndex = 0; wordIndex < wordCount; wordIndex++) {
         const word = dataview.getUint32(offset + (wordIndex << 2), true);
         for (let i = 0; i < blocksPerWord && entryIndex < BaseLayer.CUBIC_SIZE; i++, entryIndex++) {
            entries[entryIndex] = (word >>> (i * bitsPerEntry)) & mask;
         }
      }
      cursor.pointer = offset + (wordCount << 2);

      layer.palette.length = ZigZag32.deserialize(cursor);
      for (let i = 0; i < layer.palette.length; i++) {
         layer.palette[i] = VarInt32.deserialize(cursor);
      }

      return layer;
   }
}
