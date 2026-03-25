import { Cursor } from '../../cursor';
import { NBTTag } from '../nbt-tag';
import { NBT_FORMAT_WRITER } from './general';
import { WriterLike } from './writer-like';

export * from './general';
export * from './writer-like';

export function writeRootSync(
   cursor: Cursor,
   value: unknown,
   format: WriterLike = NBT_FORMAT_WRITER,
   root: string = ''
): void {
   const type = format.determinateType(value);
   format.writeType(cursor, type);
   format[8](cursor, root);
   format[type as 1](cursor, (value as number).valueOf());
}
export function writeExplicitSync(
   cursor: Cursor,
   value: unknown,
   type: NBTTag,
   format: WriterLike = NBT_FORMAT_WRITER
): void {
   if (type === 0) return;
   format[type as 1](cursor, value as number);
}
export function writeSync(cursor: Cursor, value: unknown, format: WriterLike = NBT_FORMAT_WRITER): void {
   const type = format.determinateType(value);
   format.writeType(cursor, type);
   format[type as 1](cursor, (value as number).valueOf());
}
