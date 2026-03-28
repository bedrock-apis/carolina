import { RegistrableObject } from '../abstraction/registry';
import { PublicClass } from '../abstraction/types';
import { BlockState } from './block-state';

// Internal class with public constructor
class BlockType extends RegistrableObject<string> {
   public readonly states: readonly BlockState[] = [];
   public readonly networkPaletteIndex: number = 0;
   public constructor(id: string) {
      super(id);
   }
}

/**
 * Represents a type of block, public apis
 */
type _BlockType = BlockType;
const _BlockType: PublicClass<typeof BlockType> = BlockType as unknown as PublicClass<typeof BlockType>;
export { _BlockType as BlockType, BlockType as __BLOCK_TYPE__ };
