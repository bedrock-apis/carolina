import { Cursor } from '@carolina/binary';

import { BaseLayer } from './base-layer';
import { SubChunk } from './sub-chunk';

export class Chunk {
   public readonly x;
   public readonly z;
   public readonly hash: number;
   public readonly subChunks: SubChunk[];
   public constructor(x: number, z: number) {
      this.x = x;
      this.z = z;
      this.hash = Chunk.getUniqueHash(x, z);
      this.subChunks = [];
   }
   public static getUniqueHash(x: number, z: number): number {
      // BigInts actually creates GC pressure, but numbers are optimized away in most cases thats why we make this hash hack for 24bit supported values
      return (((x << 1) ^ (x >> 31)) >>> 0) * 0xffffff + ((((z << 1) ^ (z >> 31)) >>> 0) & 0xffffff);
   }
   public static serialize(cursor: Cursor, chunk: Chunk): void {
      const subChunkCount = chunk.subChunks.length;
      for (let i = 0; i < subChunkCount; i++) SubChunk.serialize(cursor, chunk.subChunks[i]);

      for (let i = 0; i < subChunkCount; i++) {
         BaseLayer.serialize(cursor, chunk.subChunks[i].biomes);
      }

      // Border blocks?
      cursor.writeUint8(0);
   }
   public static deserialize(cursor: Cursor, subChunkCount: number): Chunk {
      const chunk = new Chunk(0, 0);
      for (let i = 0; i < subChunkCount; i++) chunk.subChunks[i] = SubChunk.deserialize(cursor);
      for (let i = 0; i < subChunkCount; i++) {
         (chunk.subChunks[i] as unknown as { biomes: BaseLayer }).biomes = BaseLayer.deserialize(cursor);
      }
      return chunk;
   }
}
