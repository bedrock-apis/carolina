import { Cursor } from '../../cursor';
import { NBTTag } from '../nbt-tag';

export interface ReaderLike {
   readType(cursor: Cursor): NBTTag;
   readStringLength(cursor: Cursor): number;
   readArrayLength(cursor: Cursor): number;

   [NBTTag.Uint8](cursor: Cursor): number;
   [NBTTag.Int16](cursor: Cursor): number;
   [NBTTag.Int32](cursor: Cursor): number;
   [NBTTag.Int64](cursor: Cursor): bigint;
   [NBTTag.Float](cursor: Cursor): number;
   [NBTTag.Double](cursor: Cursor): number;
   [NBTTag.Uint8Array](cursor: Cursor): Uint8Array;

   [NBTTag.String](cursor: Cursor): string;
   [NBTTag.Int32Array](cursor: Cursor): Int32Array;
   [NBTTag.Int64Array](cursor: Cursor): BigInt64Array;
   [NBTTag.List](cursor: Cursor): unknown[];
   [NBTTag.Compound](cursor: Cursor): object;
}
