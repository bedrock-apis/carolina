import { Cursor } from '../../cursor';
import { NBTTag } from '../nbt-tag';
import { NBT_FORMAT_READER } from './general';
import { ReaderLike } from './reader-like';

export * from './general';
export * from './reader-like';

export function readRootSync<T = unknown>(cursor: Cursor, format: ReaderLike = NBT_FORMAT_READER): T {
   const _ = format.readType(cursor);
   return (format[8](cursor), format[_ as 1](cursor) as T);
}
export function readExplicitSync<T = unknown>(
   cursor: Cursor,
   type: NBTTag,
   format: ReaderLike = NBT_FORMAT_READER
): T {
   return format[type as 1](cursor) as T;
}
export function readSync<T = unknown>(cursor: Cursor, format: ReaderLike = NBT_FORMAT_READER): T {
   return format[format.readType(cursor) as 1](cursor) as T;
}
export * from './typed-reader';
