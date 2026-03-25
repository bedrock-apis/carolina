import { RegistrableObject } from '../abstraction/registry';
import { PublicClass } from '../abstraction/types';

export interface KindTypeMap {
   string: string;
   number: number;
   boolean: boolean;
}
export type Kind = keyof KindTypeMap;

// Internal class with public constructor
export class _BlockState<T extends Kind = Kind> extends RegistrableObject<string> {
   public readonly type: T;
   public readonly options: KindTypeMap[T][] = [];
   public constructor(id: string, type: T, options: KindTypeMap[T][]) {
      super(id);
      this.type = type;
      this.options = options;
   }
}

/**
 * Represents a state of a block.
 */
export type BlockState<T extends Kind = Kind> = _BlockState<T>;
export const BlockState: PublicClass<typeof _BlockState> = _BlockState as unknown as PublicClass<
   typeof _BlockState
>;
