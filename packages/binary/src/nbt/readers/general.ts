import { Cursor } from '../../cursor';
import { VarInt32, ZigZag32, ZigZag64 } from '../../serialization';
import { NBTTag } from '../nbt-tag';
import { ReaderLike } from './reader-like';

const UTF8_DECODER = new TextDecoder();
export class GeneralReader implements ReaderLike {
   public constructor(
      public readonly littleEndian: boolean,
      public readonly textEncoder: TextDecoder
   ) {}
   static {
      // Performance benefits
      this.prototype.readType = this.prototype[NBTTag.Uint8];
      this.prototype.readArrayLength = this.prototype[NBTTag.Int32];
      this.prototype.readStringLength = this.prototype[NBTTag.Int16];
   }
   public readType(_: Cursor): NBTTag {
      return 0;
   }
   public readArrayLength(_: Cursor): number {
      return 0;
   }
   public readStringLength(_: Cursor): number {
      return 0;
   }

   /**
    *  TagType.byte
    */
   public 1(cursor: Cursor): number {
      return cursor.view.getUint8(cursor.pointer++);
   }

   /**
    *  TagType.Short
    */
   public 2(cursor: Cursor): number {
      const _ = cursor.view.getInt16(cursor.pointer, this.littleEndian);
      return ((cursor.pointer += 2), _);
   }

   /**
    *  TagType.Int
    */
   public 3(cursor: Cursor): number {
      const _ = cursor.view.getInt32(cursor.pointer, this.littleEndian);
      return ((cursor.pointer += 4), _);
   }

   /**
    *  TagType.Long
    */
   public 4(cursor: Cursor): bigint {
      const _ = cursor.view.getBigInt64(cursor.pointer, this.littleEndian);
      return ((cursor.pointer += 8), _);
   }
   /**
    *  TagType.Float
    */
   public 5(cursor: Cursor): number {
      const _ = cursor.view.getFloat32(cursor.pointer, this.littleEndian);
      return ((cursor.pointer += 4), _);
   }
   /**
    *  TagType.Double
    */
   public 6(cursor: Cursor): number {
      const _ = cursor.view.getFloat64(cursor.pointer, this.littleEndian);
      return ((cursor.pointer += 8), _);
   }

   /**
    *  TagType.ByteArray
    */
   public 7(cursor: Cursor): Uint8Array {
      const length = this.readArrayLength(cursor);
      return cursor.buffer.subarray(cursor.pointer, (cursor.pointer += length));
   }
   /**
    *  TagType.String
    */
   public 8(cursor: Cursor): string {
      const length = this.readStringLength(cursor);
      return this.textEncoder.decode(cursor.buffer.subarray(cursor.pointer, (cursor.pointer += length)));
   }
   public 11(cursor: Cursor): Int32Array {
      const length = this.readArrayLength(cursor);
      const _ = new Int32Array(length);
      const func = this['3'].bind(this, cursor);
      for (let i = 0; i < length; i++) _[i] = func();
      return _;
   }
   public 12(cursor: Cursor): BigInt64Array {
      const length = this.readArrayLength(cursor);
      const _ = new BigInt64Array(length);
      const func = this['4'].bind(this, cursor);
      for (let i = 0; i < length; i++) _[i] = func();
      return _;
   }
   public 9(cursor: Cursor): unknown[] {
      const type = this.readType(cursor);
      const length = this.readArrayLength(cursor);
      if (type === 0 || length === 0) return [];
      if (!(type in this)) throw new SyntaxError('Unexpected NBT token type: ' + type);
      // Do not use Array.from, its slow as hell, i know ecma didn't cooked well with this one
      const _: unknown[] = new Array(length);
      const func: () => unknown = this[type as 1].bind(this, cursor);
      for (let i = 0; i < length; i++) _[i] = func();
      return _;
   }
   public 10(cursor: Cursor): object {
      // Empty Object prototype for safety, maybe for performance as well?
      const _: Record<string, unknown> = {};
      let type;
      while ((type = this.readType(cursor)) !== 0) _[this['8'](cursor)] = this[type](cursor);
      return _;
   }
}
export class GeneralVariantReader extends GeneralReader {
   static {
      this.prototype[4] = ZigZag64.deserialize;
      this.prototype.readStringLength = VarInt32.deserialize;
      this.prototype.readArrayLength = this.prototype[3] = ZigZag32.deserialize;
   }
}
export const NBT_FORMAT_READER: GeneralReader = new GeneralReader(true, UTF8_DECODER);
export const NBT_NETWORK_VARIANT_FORMAT_READER: GeneralReader = new GeneralVariantReader(true, UTF8_DECODER);

export const NBT_BIG_ENDIAN_FORMAT_READER: GeneralReader = new GeneralReader(false, UTF8_DECODER);
export const NBT_BIG_ENDIAN_NETWORK_VARIANT_FORMAT_READER: GeneralReader = new GeneralVariantReader(
   false,
   UTF8_DECODER
);
