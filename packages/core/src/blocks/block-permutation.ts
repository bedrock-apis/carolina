import type { PublicClass } from '../abstraction/types';
import type { BlockType } from './block-type';

// Internal class with public constructor
export class _BlockPermutation {
   public readonly type: BlockType;
   public readonly networkPaletteIndex: number;
   public readonly networkHashId: number;
   public readonly states_value_indexes: number[];
   public constructor(
      type: BlockType,
      networkPaletteIndex: number,
      networkHashId: number,
      states_value_indexes: number[]
   ) {
      this.type = type;
      this.networkPaletteIndex = networkPaletteIndex;
      this.networkHashId = networkHashId;
      this.states_value_indexes = states_value_indexes;
      states_value_indexes.length = type.states.length;
   }
}

/**
 * Represents a specific state of a block.
 */
export type BlockPermutation = _BlockPermutation;
export const BlockPermutation: PublicClass<typeof _BlockPermutation> =
   _BlockPermutation as unknown as PublicClass<typeof _BlockPermutation>;
