import { SerializableType } from '../../serialization';
import { internalCompileToString } from '../../serialization/decorators/compiler';
import { getAndClearMeta } from '../../serialization/decorators/metadata';

/**
 * Compiles the class metadata into highly optimized serialization and deserialization functions.
 */
export function NBT<T extends { new (): unknown }>(target: T): void {
   const meta = getAndClearMeta(target);
   internalCompileToString(
      target as unknown as SerializableType<undefined>,
      meta.entries.values(),
      'new this'
   );
}

export function NBTInterface<T extends { new (): unknown }>(target: T): void {
   const meta = getAndClearMeta(target);
   internalCompileToString(
      target as unknown as SerializableType<undefined>,
      meta.entries.values(),
      'new this'
   );
}
