import type { PublicClass } from '../abstraction/types';
import type { BlockType } from './block-type';

// Internal class with public constructor
export class _BlockPermutation {
   public readonly type: BlockType;
   public readonly networkPaletteIndex: number;
   public readonly networkPaletteIndexOffset: number;
   public readonly networkHashId: number;
   public readonly blockStatesValueIndexes: readonly number[];
   public constructor(
      type: BlockType,
      networkPaletteIndex: number,
      networkHashId: number,
      states_value_indexes: number[]
   ) {
      this.type = type;
      this.networkPaletteIndex = networkPaletteIndex;
      this.networkHashId = networkHashId;
      this.blockStatesValueIndexes = states_value_indexes;

      // Get the relative offset
      this.networkPaletteIndexOffset = this.networkPaletteIndex - this.type.networkPaletteIndex;
   }
}

/**
 * Represents a specific state of a block.
 */
export type BlockPermutation = _BlockPermutation;
export const BlockPermutation: PublicClass<typeof _BlockPermutation> =
   _BlockPermutation as unknown as PublicClass<typeof _BlockPermutation>;
