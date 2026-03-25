import { IDataCursor, TagType } from '@bedrock-apis/nbt-core';

import { NBT_FORMAT_READER } from './general';
import { ReaderLike } from './reader-like';

export * from './general';
export * from './reader-like';

export function parseRootSync<T = unknown>(cursor: IDataCursor, format: ReaderLike = NBT_FORMAT_READER): T {
   const _ = format.readType(cursor);
   return (format[8](cursor), format[_ as 1](cursor) as T);
}
export function parseExplicitSync<T = unknown>(
   cursor: IDataCursor,
   type: TagType,
   format: ReaderLike = NBT_FORMAT_READER
): T {
   return format[type as 1](cursor) as T;
}
export function parseSync<T = unknown>(cursor: IDataCursor, format: ReaderLike = NBT_FORMAT_READER): T {
   return format[format.readType(cursor) as 1](cursor) as T;
}
export * from './typed-reader';
