import { InjectAsNoEnumerableStruct } from '@carolina/common';

import { VALUE_TYPE_CONSTRUCTOR_FACTORY, ValueType, ValueTypeConstructor } from '../value-type';
import { NumberType } from './common-number-type';

export interface ZigZag32Constructor extends ValueTypeConstructor<ZigZag32, number> {
   encode(value: number): number;
   decode(value: number): number;
}
export interface ZigZag32 extends ValueType<number> {}
export const ZigZag32: ZigZag32Constructor = VALUE_TYPE_CONSTRUCTOR_FACTORY(
   'ZigZag32',
   0,
   NumberType
) as ZigZag32Constructor;

InjectAsNoEnumerableStruct(ZigZag32, {
   deserialize(cursor) {
      const pointer = cursor.pointer;
      for (let i = pointer, shift = 0, num = 0; i < pointer + 5; i++, shift += 7) {
         const byte = cursor.buffer[i];
         num |= (byte & 0x7f) << shift;
         if ((byte & 0x80) === 0) return ((cursor.pointer = i + 1), (num >>> 1) ^ -(num & 1));
      }
      throw new Error('ZigZag32 too long: exceeds 5 bytes');
   },
   serialize(cursor, value) {
      value = (value << 1) ^ (value >> 31);
      value >>>= 0;
      for (let i = 0; i < 5; i++) {
         if ((value & ~0x7f) === 0) return void (cursor.buffer[cursor.pointer++] = value);
         cursor.buffer[cursor.pointer++] = (value & 0x7f) | 0x80;
         value >>>= 7;
      }
   },
   encode(n) {
      return (n << 1) ^ (n >> 31);
   },
   decode(n: number): number {
      return (n >>> 1) ^ -(n & 1);
   },
});

export interface ZigZag64Constructor extends ValueTypeConstructor<ZigZag64, bigint> {
   encode(value: bigint): bigint;
   decode(value: bigint): bigint;
}
export interface ZigZag64 extends ValueType<bigint> {}
export const ZigZag64: ZigZag64Constructor = VALUE_TYPE_CONSTRUCTOR_FACTORY(
   'ZigZag64',
   0n,
   NumberType
) as ZigZag64Constructor;

InjectAsNoEnumerableStruct(ZigZag64, {
   deserialize(cursor) {
      const pointer = cursor.pointer;
      for (let i = pointer, shift = 0n, num = 0n; i < pointer + 10; i++, shift += 7n) {
         const byte = cursor.buffer[i];
         num |= (BigInt(byte) & 0x7fn) << shift;
         if ((byte & 0x80) === 0) return ((cursor.pointer = i + 1), (num >> 1n) ^ -(num & 1n));
      }
      throw new Error('ZigZag64 too long: exceeds 10 bytes');
   },
   serialize(cursor, value) {
      value = (value << 1n) ^ (value >> 63n);
      for (let i = 0; i < 10; i++) {
         if ((value & ~0x7fn) === 0n) return void (cursor.buffer[cursor.pointer++] = Number(value));
         cursor.buffer[cursor.pointer++] = Number((value & 0x7fn) | 0x80n);
         value >>= 7n;
      }
   },
   encode(n) {
      return (n << 1n) ^ (n >> 63n);
   },
   decode(n: bigint): bigint {
      return (n >> 1n) ^ -(n & 1n);
   },
});
