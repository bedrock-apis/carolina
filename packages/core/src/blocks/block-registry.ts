import { FNVHasher } from '@carolina/common';

import { ObjectTypeRegistry } from '../abstraction/registry';
import { InternalAccess } from '../abstraction/types';
import { _BlockPermutation, BlockPermutation } from './block-permutation';
import { BlockState } from './block-state';
import { BlockType } from './block-type';

export class BlockRegistry extends ObjectTypeRegistry<BlockType> {
   protected readonly paletteInternal: BlockPermutation[] = [];
   protected readonly permutationsInternal: Map<number, BlockPermutation> = new Map();

   // Public Readonly exports
   public readonly palette: readonly BlockPermutation[] = this.paletteInternal;
   //public readonly permutations: ReadonlyMap<number, BlockPermutation> = this.permutationsInternal;

   public override finalize(): void {
      //Helpers
      const HASH_BUFFER = new Uint8Array(256);
      const TEXT_ENCODER = new TextEncoder();

      // Sort block types by hash
      const BLOCK_TYPES = Array.from(this.registry.values()).map(_ => {
         const { written } = TEXT_ENCODER.encodeInto(_.id, HASH_BUFFER);
         return { HASH: FNVHasher.FNV1_64_HASH(HASH_BUFFER.subarray(0, written)), type: _ };
      });

      BLOCK_TYPES.sort((a, b) => {
         if (a.HASH < b.HASH) return -1;
         if (a.HASH > b.HASH) return 1;
         return 0;
      });

      // Generate permutations
      for (const blockType of BLOCK_TYPES) {
         this.registerPermutationsFor(blockType.type);
      }

      // Finalize
      super.finalize();
   }
   protected registerPermutationsFor(blockType: BlockType): void {
      const networkPaletteIndex = this.paletteInternal.length;

      // We want to set the base network palette index for the type it self
      (blockType as InternalAccess<BlockType>).networkPaletteIndex = networkPaletteIndex;

      // Let's properly sort them based on their ids or names
      (blockType.states as BlockState[]).sort((a, b) => a.id.localeCompare(b.id));

      const states = blockType.states;
      const statesOptions = states.map(_ => _.options);
      const totalPermutationsCount = states.map(_ => _.options.length).reduce((acc, count) => acc * count, 1);

      for (let i = 0; i < totalPermutationsCount; i++) {
         // State values
         const stateValueIndexes = new Array(blockType.states.length);
         let remainder = i;
         for (let j = states.length - 1; j >= 0; j--) {
            // Getting the right indexes
            stateValueIndexes[j] = remainder % statesOptions[j].length;
            remainder = Math.floor(remainder / statesOptions[j].length);
         }

         //let hash = BlockPermutationUtils.getHash(blockType, stateValueIndexes);
         //while (this.permutationsInternal.has(hash)) hash++;

         const permutation = new _BlockPermutation(
            blockType,
            this.paletteInternal.length,
            -1,
            stateValueIndexes
         );
         this.paletteInternal.push(permutation);
         //this.permutationsInternal.set(hash, permutation);
      }
   }
   public resolve(type: BlockType, states?: Record<string, number | boolean | string>): BlockPermutation {
      const blockTypeStates = type.states;
      if (!blockTypeStates.length || !states) return this.palette[type.networkPaletteIndex];
      let offset = 0;
      for (let i = 0; i < type.states.length; i++) {
         const { id, options } = blockTypeStates[i];
         offset *= options.length;
         offset += states[id] !== undefined ? options.indexOf(states[id]) : 0;
      }
      return this.palette[type.networkPaletteIndex + offset];
   }
}
