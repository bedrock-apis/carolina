import { IDataCursor, TagType } from '@bedrock-apis/nbt-core';

import { readVarInt32, readVarInt64, UTF8_DECODER } from '../shared';
import { ReaderLike } from './reader-like';

export class GeneralReader implements ReaderLike {
   public constructor(
      public readonly littleEndian: boolean,
      public readonly textEncoder: TextDecoder
   ) {}
   static {
      // Performance benefits
      this.prototype.readType = this.prototype[TagType.Byte];
      this.prototype.readArrayLength = this.prototype[TagType.Int];
      this.prototype.readStringLength = this.prototype[TagType.Short];
   }
   public readType(_: IDataCursor): TagType {
      return 0;
   }
   public readArrayLength(_: IDataCursor): number {
      return 0;
   }
   public readStringLength(_: IDataCursor): number {
      return 0;
   }

   /**
    *  TagType.byte
    */
   public 1(cursor: IDataCursor): number {
      return cursor.view.getUint8(cursor.pointer++);
   }

   /**
    *  TagType.Short
    */
   public 2(cursor: IDataCursor): number {
      const _ = cursor.view.getInt16(cursor.pointer, this.littleEndian);
      return ((cursor.pointer += 2), _);
   }

   /**
    *  TagType.Int
    */
   public 3(cursor: IDataCursor): number {
      const _ = cursor.view.getInt32(cursor.pointer, this.littleEndian);
      return ((cursor.pointer += 4), _);
   }

   /**
    *  TagType.Long
    */
   public 4(cursor: IDataCursor): bigint {
      const _ = cursor.view.getBigInt64(cursor.pointer, this.littleEndian);
      return ((cursor.pointer += 8), _);
   }
   /**
    *  TagType.Float
    */
   public 5(cursor: IDataCursor): number {
      const _ = cursor.view.getFloat32(cursor.pointer, this.littleEndian);
      return ((cursor.pointer += 4), _);
   }
   /**
    *  TagType.Double
    */
   public 6(cursor: IDataCursor): number {
      const _ = cursor.view.getFloat64(cursor.pointer, this.littleEndian);
      return ((cursor.pointer += 8), _);
   }

   /**
    *  TagType.ByteArray
    */
   public 7(cursor: IDataCursor): Uint8Array {
      const length = this.readArrayLength(cursor);
      return cursor.buffer.subarray(cursor.pointer, (cursor.pointer += length));
   }
   /**
    *  TagType.String
    */
   public 8(cursor: IDataCursor): string {
      const length = this.readStringLength(cursor);
      return this.textEncoder.decode(cursor.buffer.subarray(cursor.pointer, (cursor.pointer += length)));
   }
   public 11(cursor: IDataCursor): Int32Array {
      const length = this.readArrayLength(cursor);
      const _ = new Int32Array(length);
      const func = this['3'].bind(this, cursor);
      for (let i = 0; i < length; i++) _[i] = func();
      return _;
   }
   public 12(cursor: IDataCursor): BigInt64Array {
      const length = this.readArrayLength(cursor);
      const _ = new BigInt64Array(length);
      const func = this['4'].bind(this, cursor);
      for (let i = 0; i < length; i++) _[i] = func();
      return _;
   }
   public 9(cursor: IDataCursor): unknown[] {
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
   public 10(cursor: IDataCursor): object {
      // Empty Object prototype for safety, maybe for performance as well?
      const _: Record<string, unknown> = {};
      let type;
      while ((type = this.readType(cursor)) !== 0) _[this['8'](cursor)] = this[type](cursor);
      return _;
   }
}
export class GeneralVariantReader extends GeneralReader {
   static {
      this.prototype[4] = readVarInt64;
      this.prototype.readArrayLength = this.prototype.readStringLength = this.prototype[3] = readVarInt32;
   }
}
export const NBT_FORMAT_READER: GeneralReader = new GeneralReader(true, UTF8_DECODER);
export const NBT_NETWORK_VARIANT_FORMAT_READER: GeneralReader = new GeneralVariantReader(true, UTF8_DECODER);

export const NBT_BIG_ENDIAN_FORMAT_READER: GeneralReader = new GeneralReader(false, UTF8_DECODER);
export const NBT_BIG_ENDIAN_NETWORK_VARIANT_FORMAT_READER: GeneralReader = new GeneralVariantReader(
   false,
   UTF8_DECODER
);
