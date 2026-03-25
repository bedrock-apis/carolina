import { Cursor } from '@carolina/binary';

import { BaseLayer } from './base-layer';
import { SubChunkLayer } from './sub-chunk-layer';

export class SubChunk {
   public readonly version: number = 9;
   public readonly index: number = -4;
   public readonly layers: SubChunkLayer[] = [new SubChunkLayer()];
   public readonly biomes: BaseLayer = new BaseLayer();
   public static serialize(cursor: Cursor, subChunk: SubChunk): void {
      cursor.writeUint8(subChunk.version);
      cursor.writeUint8(subChunk.layers.length);

      if (subChunk.version === 9) cursor.writeUint8(subChunk.index);
      for (const layer of subChunk.layers) SubChunkLayer.serialize(cursor, layer);
   }
   public static deserialize(cursor: Cursor): SubChunk {
      const subChunk = new SubChunk();
      (subChunk as unknown as { version: number }).version = cursor.readUint8();
      subChunk.layers.length = cursor.readUint8();
      if (subChunk.version === 9) (subChunk as unknown as { index: number }).index = cursor.readUint8();
      for (let i = 0; i < subChunk.layers.length; i++) subChunk.layers[i] = SubChunkLayer.deserialize(cursor);
      return subChunk;
   }
}
