import { Cursor } from '@carolina/binary';

import { InternalAccess } from '../../abstraction/types';
import { BlockTypes } from '../../blocks';
import { BaseLayer } from './base-layer';
import FastNoiseType, { FractalType, NoiseType } from './simplex-noise';
import { SubChunk } from './sub-chunk';

export class Chunk {
   public readonly x;
   public readonly z;
   public readonly hash: number;
   public readonly subChunks: SubChunk[];
   public readonly offset: number;
   public constructor(x: number, z: number, offset: number) {
      this.x = x;
      this.z = z;
      this.offset = offset;
      this.hash = Chunk.getUniqueHash(x, z);
      this.subChunks = [];
   }
   public generate(): void {
      const X = this.x << 4;
      const Z = this.z << 4;
      const height_map = new Float32Array(256);
      const noise = new FastNoiseType(654321);
      noise.SetNoiseType(NoiseType.Perlin);
      noise.SetFractalOctaves(2);
      noise.SetFractalType(FractalType.FBm);
      noise.SetFrequency(0.015);

      // 1. Generate normalized height map (0.0 to 1.0)
      for (let x = 0; x < 16; x++) {
         for (let z = 0; z < 16; z++) {
            height_map[(x << 4) | z] = noise.GetNoise(X + x, Z + z) * 0.5 + 0.5;
         }
      }

      const grassId = BlockTypes.get('minecraft:grass_block')?.networkPaletteIndex ?? 0;

      // 2. Iterate through subchunks (16-block vertical segments)
      for (let sY = -4; sY < 0; sY++) {
         const subchunk = this.getSubChunk(sY);
         const layer = subchunk.layers[0];
         layer.palette[1] = grassId;

         // 3. Fill blocks within this specific subchunk
         for (let xz = 0; xz < 256; xz++) {
            const worldHeight = height_map[xz] * 64 - 64;
            for (let localY = 0; localY < 16; localY++) {
               const absoluteY = (sY << 4) | localY;
               const block = absoluteY < worldHeight ? 1 : 0;
               // Standard Minecraft storage: (x << 8) | (z << 4) | y
               // Or your specific format: (xz << 4) | localY
               layer.entries[(xz << 4) | localY] = block;
            }
         }
      }
   }
   public getSubChunk(index: number): SubChunk {
      //console.log(index - this.offset);
      for (let i = this.subChunks.length; i <= index - this.offset; i++) {
         const sub_chunk = new SubChunk();
         (sub_chunk as InternalAccess<SubChunk>).index = index;
         this.subChunks.push(sub_chunk);
      }
      return this.subChunks[index - this.offset];
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
      const chunk = new Chunk(0, 0, -4);
      for (let i = 0; i < subChunkCount; i++) chunk.subChunks[i] = SubChunk.deserialize(cursor);
      for (let i = 0; i < subChunkCount; i++) {
         (chunk.subChunks[i] as unknown as { biomes: BaseLayer }).biomes = BaseLayer.deserialize(cursor);
      }
      return chunk;
   }
}
