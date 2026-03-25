import { FNVHasher } from '@carolina/common';

import { ObjectTypeRegistry } from '../abstraction/registry';
import { _BlockPermutation, BlockPermutation } from './block-permutation';
import { BlockState } from './block-state';
import { BlockType } from './block-type';
import { BlockPermutationUtils } from './utils';

export class BlockStateRegistry extends ObjectTypeRegistry<BlockState> {
   public override finalize(): void {
      //const types = [...this.registry.values()].sort((a, b) => a.id.localeCompare(b.id));
      //this.registry.clear();
      super.finalize();
   }
}
export class BlockRegistry extends ObjectTypeRegistry<BlockType> {
   protected readonly paletteInternal: BlockPermutation[] = [];
   protected readonly permutationsInternal: Map<number, BlockPermutation> = new Map();

   // Public Readonly exports
   public readonly palette: readonly BlockPermutation[] = this.paletteInternal;
   public readonly permutations: ReadonlyMap<number, BlockPermutation> = this.permutationsInternal;

   public override finalize(): void {
      //Helpers
      const HASH_BUFFER = new Uint8Array(256);
      const TEXT_ENCODER = new TextEncoder();

      // Sort block types by hash
      const BLOCK_TYPES = Array.from(this.registry.values()).map(_ => {
         const { written } = TEXT_ENCODER.encodeInto(_.id, HASH_BUFFER);
         return { HASH: FNVHasher.FNV1_64_HASH(HASH_BUFFER.subarray(0, written)), type: _ };
      });
      BLOCK_TYPES.sort((a, b) => (a.HASH < b.HASH ? -1 : a.HASH > b.HASH ? 1 : 0));

      // Generate permutations
      for (const blockType of BLOCK_TYPES) {
         this.registerPermutationsFor(blockType.type);
      }

      // Finalize
      super.finalize();
   }
   protected registerPermutationsFor(blockType: BlockType): void {
      const states = blockType.states;
      const stateCounts = states.map(state => state.options.length);
      const totalPermutations = stateCounts.reduce((acc, count) => acc * count, 1);

      for (let i = 0; i < totalPermutations; i++) {
         const withStates = new Array(states.length);
         let remainder = i;

         for (let j = states.length - 1; j >= 0; j--) {
            withStates[j] = remainder % stateCounts[j];
            remainder = Math.floor(remainder / stateCounts[j]);
         }

         let hash = BlockPermutationUtils.getHash(blockType, withStates);
         while (this.permutationsInternal.has(hash)) hash++;

         const permutation = new _BlockPermutation(blockType, this.paletteInternal.length, hash, withStates);
         this.paletteInternal.push(permutation);
         this.permutationsInternal.set(hash, permutation);
      }
   }
}
