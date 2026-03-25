import { Cursor } from '../../cursor';
import { NBTTag } from '../nbt-tag';

export interface ReaderLike {
   readType(cursor: Cursor): NBTTag;
   readStringLength(cursor: Cursor): number;
   readArrayLength(cursor: Cursor): number;

   [NBTTag.Byte](cursor: Cursor): number;
   [NBTTag.Short](cursor: Cursor): number;
   [NBTTag.Int](cursor: Cursor): number;
   [NBTTag.Long](cursor: Cursor): bigint;
   [NBTTag.Float](cursor: Cursor): number;
   [NBTTag.Double](cursor: Cursor): number;
   [NBTTag.ByteArray](cursor: Cursor): Uint8Array;

   [NBTTag.String](cursor: Cursor): string;
   [NBTTag.IntArray](cursor: Cursor): Int32Array;
   [NBTTag.LongArray](cursor: Cursor): BigInt64Array;
   [NBTTag.List](cursor: Cursor): unknown[];
   [NBTTag.Compound](cursor: Cursor): object;
}
