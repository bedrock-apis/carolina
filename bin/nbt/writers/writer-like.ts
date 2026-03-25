import { Cursor } from '../../cursor';
import { NBTTag } from '../nbt-tag';

export interface WriterLike {
   writeType(cursor: Cursor, value: NBTTag): void;
   writeStringLength(cursor: Cursor, length: number): void;
   writeArrayLength(cursor: Cursor, length: number): void;

   [NBTTag.Byte](cursor: Cursor, value: number): void;
   [NBTTag.Short](cursor: Cursor, value: number): void;
   [NBTTag.Int](cursor: Cursor, value: number): void;
   [NBTTag.Long](cursor: Cursor, value: bigint): void;
   [NBTTag.Float](cursor: Cursor, value: number): void;
   [NBTTag.Double](cursor: Cursor, value: number): void;
   [NBTTag.ByteArray](cursor: Cursor, value: Uint8Array): void;

   [NBTTag.String](cursor: Cursor, value: string): void;
   [NBTTag.IntArray](cursor: Cursor, value: Int32Array): void;
   [NBTTag.LongArray](cursor: Cursor, value: BigInt64Array): void;
   [NBTTag.List](cursor: Cursor, value: unknown[]): void;
   [NBTTag.Compound](cursor: Cursor, value: object): void;

   determinateType(_: unknown): NBTTag;
}
