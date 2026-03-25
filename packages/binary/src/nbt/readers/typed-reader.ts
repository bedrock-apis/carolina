import { Cursor } from '../../cursor';
import { NBTTag } from '../nbt-tag';
import { ReaderLike } from './reader-like';

export type TypeLike = new (n: number) => { value: number };
export interface ITypedReader {
   1(cursor: Cursor, format: ReaderLike): { value: number };
   2(cursor: Cursor, format: ReaderLike): { value: number };
   3(cursor: Cursor, format: ReaderLike): { value: number };
   5(cursor: Cursor, format: ReaderLike): { value: number };
   6(cursor: Cursor, format: ReaderLike): { value: number };
   4(cursor: Cursor, format: ReaderLike): bigint;
   7(cursor: Cursor, format: ReaderLike): Uint8Array;
   8(cursor: Cursor, format: ReaderLike): string;
   9(cursor: Cursor, format: ReaderLike): unknown[];
   10(cursor: Cursor, format: ReaderLike): object;
   11(cursor: Cursor, format: ReaderLike): Int32Array;
   12(cursor: Cursor, format: ReaderLike): BigInt64Array;
}
export function CreateTypedReader(
   Byte: TypeLike,
   Short: TypeLike,
   Int: TypeLike,
   Float: TypeLike,
   Double: TypeLike
): ITypedReader {
   return class TypedReader {
      public static 1(cursor: Cursor, format: ReaderLike) {
         return new Byte(format[1](cursor));
      }
      public static 2(cursor: Cursor, format: ReaderLike) {
         return new Short(format[2](cursor));
      }
      public static 3(cursor: Cursor, format: ReaderLike) {
         return new Int(format[3](cursor));
      }
      public static 5(cursor: Cursor, format: ReaderLike) {
         return new Float(format[5](cursor));
      }
      public static 6(cursor: Cursor, format: ReaderLike) {
         return new Double(format[6](cursor));
      }
      public static 4(cursor: Cursor, format: ReaderLike) {
         return format[4](cursor);
      }
      public static 7(cursor: Cursor, format: ReaderLike) {
         return format[7](cursor);
      }
      public static 8(cursor: Cursor, format: ReaderLike) {
         return format[8](cursor);
      }
      public static 11(cursor: Cursor, format: ReaderLike) {
         return format[11](cursor);
      }
      public static 12(cursor: Cursor, format: ReaderLike) {
         return format[12](cursor);
      }
      public static 10(cursor: Cursor, format: ReaderLike) {
         // Empty Object prototype for safety, maybe for performance as well?
         const _: Record<string, unknown> = {};
         let type;
         while ((type = format.readType(cursor)) !== 0)
            _[format['8'](cursor)] = this[type as 1](cursor, format);
         return _;
      }
      public static 9(cursor: Cursor, format: ReaderLike) {
         const type = format.readType(cursor);
         const length = format.readArrayLength(cursor);
         if (type === 0 || length === 0) return [];
         if (!(type in this)) throw new SyntaxError('Unexpected NBT token type: ' + type);
         // Do not use Array.from, its slow as hell, i know ecma didn't cooked well with this one
         // eslint-disable-next-line no-new-array
         const _: unknown[] = new Array(length);
         const func: () => unknown = this[type as 1].bind(this, cursor, format);
         for (let i = 0; i < length; i++) _[i] = func();
         return _;
      }
      public static parseRootSync<T>(this: typeof TypedReader, cursor: Cursor, format: ReaderLike): T {
         const type = format.readType(cursor);
         format[8](cursor);
         return this[type as 1](cursor, format) as T;
      }
      public static parseSync<T>(this: typeof TypedReader, cursor: Cursor, format: ReaderLike): T {
         const type = format.readType(cursor);
         return this[type as 1](cursor, format) as T;
      }
      public static parseExplicitSync<T>(
         this: typeof TypedReader,
         cursor: Cursor,
         type: NBTTag,
         format: ReaderLike
      ): T {
         return this[type as 1](cursor, format) as T;
      }
   };
}
