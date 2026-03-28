import { FNVHasher } from '@carolina/common';

import { BlockType } from './block-type';

export class BlockPermutationUtils {
   public static readonly TEXT_ENCODER = new TextEncoder();
   public static readonly CACHE: Uint8Array = new Uint8Array(256);
   public static readonly BINARY_PREFIX: Uint8Array = this.CACHE.subarray(0, 10);
   public static readonly BINARY_SUFFIX: Uint8Array = this.CACHE.subarray(10);
   public static readonly PRECALCULATED_HASH: number;
   static {
      // This is hardcoded NBT prefix SNBT example: "": {"name":
      this.CACHE.set([10, 0, 0, 8, 4, 0, 110, 97, 109, 101], 0);
      (
         this as { PRECALCULATED_HASH: (typeof BlockPermutationUtils)['PRECALCULATED_HASH'] }
      ).PRECALCULATED_HASH = FNVHasher.FNV_32A_HASH(this.BINARY_PREFIX);
   }

   public static getHash(type: BlockType, indexes: number[]): number {
      const { length } = this.toBinary(type, indexes);
      return FNVHasher.FNV_32A_HASH(
         this.BINARY_SUFFIX.subarray(0, length - this.BINARY_PREFIX.length),
         this.PRECALCULATED_HASH
      );
   }

   public static toBinary(type: BlockType, indexes: number[]): Uint8Array {
      return new Uint8Array();
      /*
      // HardCoded NBT Serialization
      const { BINARY_SUFFIX, TEXT_ENCODER } = this;

      let offset = 0;
      // Int16LE
      BINARY_SUFFIX[offset++] = type.id.length;
      BINARY_SUFFIX[offset++] = 0;
      TEXT_ENCODER.encodeInto(type.id, BINARY_SUFFIX.subarray(offset));
      offset += type.id.length;
      BINARY_SUFFIX[offset++] = 10; // NBTTag.Compound
      BINARY_SUFFIX[offset++] = 'states'.length; // "states".length
      BINARY_SUFFIX[offset++] = 0;
      TEXT_ENCODER.encodeInto('states', BINARY_SUFFIX.subarray(offset));
      offset += 'states'.length;

      for (let i = 0; i < type.states.length; i++) {
         const state = type.states[i];
         BINARY_SUFFIX[offset++] = 8; // NBTTag.String
         BINARY_SUFFIX[offset++] = state.id.length;
         BINARY_SUFFIX[offset++] = 0;
         TEXT_ENCODER.encodeInto(state.id, BINARY_SUFFIX.subarray(offset));
         offset += state.id.length;
         const value = state.options[indexes[i] ?? 0];
         switch (typeof value) {
            case 'string':
               BINARY_SUFFIX[offset++] = 8; // NBTTag.String
               BINARY_SUFFIX[offset++] = value.length;
               BINARY_SUFFIX[offset++] = 0;
               TEXT_ENCODER.encodeInto(value, BINARY_SUFFIX.subarray(offset));
               offset += value.length;
               break;
            case 'number':
               BINARY_SUFFIX[offset++] = 3; // NBTTag.Int
               BINARY_SUFFIX[offset++] = value & 0xff;
               BINARY_SUFFIX[offset++] = (value >> 8) & 0xff;
               BINARY_SUFFIX[offset++] = (value >> 16) & 0xff;
               BINARY_SUFFIX[offset++] = (value >> 24) & 0xff;
               break;
            case 'boolean':
               BINARY_SUFFIX[offset++] = 1; // NBTTag.Byte
               BINARY_SUFFIX[offset++] = value ? 1 : 0;
               break;
         }
      }
      BINARY_SUFFIX[offset++] = 0; // NBTTag.End
      BINARY_SUFFIX[offset++] = 0; // NBTTag.EndOfRoot
      return this.CACHE.subarray(0, this.BINARY_PREFIX.length + offset);*/
   }
}
