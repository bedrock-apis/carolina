import { RegistrableObject } from '../abstraction/registry';
import { PublicClass } from '../abstraction/types';
import { BlockState } from './block-state';

// Internal class with public constructor
export class _BlockType extends RegistrableObject<string> {
   public states: readonly BlockState[] = [];
   public constructor(id: string) {
      super(id);
   }
}

/**
 * Represents a type of block, public apis
 */
export type BlockType = _BlockType;
export const BlockType: PublicClass<typeof _BlockType> = _BlockType as unknown as PublicClass<
   typeof _BlockType
>;
