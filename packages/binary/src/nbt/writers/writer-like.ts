import { ICursor } from '../../cursor';
import { NBTTag } from '../nbt-tag';

export interface WriterLike {
   writeType(cursor: ICursor, value: NBTTag): void;
   writeStringLength(cursor: ICursor, length: number): void;
   writeArrayLength(cursor: ICursor, length: number): void;

   [NBTTag.Uint8](cursor: ICursor, value: number): void;
   [NBTTag.Int16](cursor: ICursor, value: number): void;
   [NBTTag.Int32](cursor: ICursor, value: number): void;
   [NBTTag.Int64](cursor: ICursor, value: bigint): void;
   [NBTTag.Float](cursor: ICursor, value: number): void;
   [NBTTag.Double](cursor: ICursor, value: number): void;
   [NBTTag.Uint8Array](cursor: ICursor, value: Uint8Array): void;

   [NBTTag.String](cursor: ICursor, value: string): void;
   [NBTTag.Int32Array](cursor: ICursor, value: Int32Array): void;
   [NBTTag.Int64Array](cursor: ICursor, value: BigInt64Array): void;
   [NBTTag.List](cursor: ICursor, value: unknown[]): void;
   [NBTTag.Compound](cursor: ICursor, value: object): void;

   determinateType(_: unknown): NBTTag;
}
