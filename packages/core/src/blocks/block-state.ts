import { PublicClass } from '../abstraction/types';

export interface KindTypeMap {
   string: string;
   number: number;
   boolean: boolean;
}
export type Kind = keyof KindTypeMap;

// Internal class with public constructor
class BlockState<T extends Kind = Kind> {
   public readonly id: string;
   public readonly type: T;
   public readonly options: readonly KindTypeMap[T][] = [];
   public constructor(id: string, type: T, options: KindTypeMap[T][]) {
      this.id = id;
      this.type = type;
      this.options = options;
   }
}

/**
 * Represents a state of a block.
 */
type _BlockState<T extends Kind = Kind> = BlockState<T>;
const _BlockState: PublicClass<typeof BlockState> = BlockState as unknown as PublicClass<typeof BlockState>;

export { _BlockState as BlockState, BlockState as __BLOCK_STATE__ };
