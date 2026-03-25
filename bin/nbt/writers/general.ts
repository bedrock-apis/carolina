import { NBTTag } from '../nbt-tag';
import { UTF8_BUFFER_HELPER, UTF8_ENCODER, writeVarInt32, writeVarInt64 } from '../shared';
import { WriterLike } from './writer-like';

const { keys } = Object;
export class GeneralWriter implements WriterLike {
   public constructor(
      public readonly littleEndian: boolean,
      public readonly textEncoder: TextEncoder
   ) {}
   static {
      // Performance benefits
      this.prototype.writeType = this.prototype[NBTTag.Byte];
      this.prototype.writeArrayLength = this.prototype[NBTTag.Int];
      this.prototype.writeStringLength = this.prototype[NBTTag.Short];
   }
   public writeType(_cursor: IDataCursor, _: number): void {}
   public writeStringLength(_cursor: IDataCursor, _: number): void {}
   public writeArrayLength(_cursor: IDataCursor, _: number): void {}
   public 1(cursor: IDataCursor, _: number): void {
      cursor.view.setUint8(cursor.pointer++, _);
   }
   public 2(cursor: IDataCursor, _: number): void {
      cursor.view.setUint16(cursor.pointer, _, this.littleEndian);
      cursor.pointer += 2;
   }
   public 3(cursor: IDataCursor, _: number): void {
      cursor.view.setUint32(cursor.pointer, _, this.littleEndian);
      cursor.pointer += 4;
   }
   public 4(cursor: IDataCursor, _: bigint): void {
      cursor.view.setBigUint64(cursor.pointer, _, this.littleEndian);
      cursor.pointer += 8;
   }
   public 5(cursor: IDataCursor, _: number): void {
      cursor.view.setFloat32(cursor.pointer, _, this.littleEndian);
      cursor.pointer += 4;
   }
   public 6(cursor: IDataCursor, _: number): void {
      cursor.view.setFloat64(cursor.pointer, _, this.littleEndian);
      cursor.pointer += 8;
   }
   public 7(cursor: IDataCursor, _: Uint8Array): void {
      this.writeArrayLength(cursor, _.length);
      cursor.buffer.set(_, cursor.pointer);
      cursor.pointer += _.byteLength;
   }
   public 8(cursor: IDataCursor, _: string): void {
      if (_.length === 0) return void this.writeStringLength(cursor, 0);
      const { written } = this.textEncoder.encodeInto(_, UTF8_BUFFER_HELPER);
      this.writeStringLength(cursor, written);
      cursor.buffer.set(UTF8_BUFFER_HELPER.subarray(0, written), cursor.pointer);
      cursor.pointer += written;
   }
   public 9(cursor: IDataCursor, _: unknown[]): void {
      if (_.length === 0) {
         this.writeType(cursor, NBTTag.EndOfCompound);
         this.writeArrayLength(cursor, 0);
         return;
      }
      const type = this.determinateType(_[0]);
      const writer = this[type as 1].bind(this, cursor);
      const length = _.length;
      this.writeType(cursor, type);
      this.writeArrayLength(cursor, length);
      for (let i = 0; i < length; i++) writer((_[i] as number).valueOf());
   }
   public 10(cursor: IDataCursor, _: object): void {
      const k = keys(_);
      for (let i = 0; i < k.length; i++) {
         const key = k[i];
         const value = _[key as keyof typeof _];
         const type = this.determinateType(value);
         if (type === 0) continue;
         this.writeType(cursor, type);
         this['8'](cursor, key);
         this[type as 1](cursor, (value as number).valueOf());
      }
      this.writeType(cursor, 0);
   }
   public 11(cursor: IDataCursor, _: Int32Array): void {
      const length = _.length;
      this.writeArrayLength(cursor, length);
      const writer = this[3].bind(this, cursor);
      for (let i = 0; i < length; i++) writer(_[i]);
   }
   public 12(cursor: IDataCursor, _: BigInt64Array): void {
      const length = _.length;
      this.writeArrayLength(cursor, length);
      const writer = this[4].bind(this, cursor);
      for (let i = 0; i < length; i++) writer(_[i]);
   }
   //NOTE - We could think of prototype based serialization something like
   // new Byte().serializeNBT(cursor, format); and recursively like that
   public determinateType(_: unknown): NBTTag {
      switch (typeof _) {
         case 'bigint':
            return 4;
         case 'number':
            return 3; //int
         case 'boolean':
            return 1;
         case 'string':
            return 8;
         case 'object':
            return (_ as object).__internal_tag_type__ ?? 10;
      }
      return 0;
   }
}
export class GeneralVariantWriter extends GeneralWriter {
   static {
      this.prototype[4] = writeVarInt64;
      this.prototype.writeArrayLength = this.prototype.writeStringLength = this.prototype[3] = writeVarInt32;
   }
}
export const NBT_FORMAT_WRITER: GeneralWriter = new GeneralWriter(true, UTF8_ENCODER);
export const NBT_NETWORK_VARIANT_FORMAT_WRITER: GeneralWriter = new GeneralVariantWriter(true, UTF8_ENCODER);

export const NBT_BIG_ENDIAN_FORMAT_WRITER: GeneralWriter = new GeneralWriter(false, UTF8_ENCODER);
export const NBT_BIG_ENDIAN_NETWORK_VARIANT_FORMAT_WRITER: GeneralWriter = new GeneralVariantWriter(
   false,
   UTF8_ENCODER
);
