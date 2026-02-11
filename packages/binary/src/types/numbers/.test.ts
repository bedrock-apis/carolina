import { expect, suite, test } from 'vitest';

import { Byte, Short, UShort, Int, UInt, Long, ULong, VarInt, VarLong, ZigZag, ZigZong } from '.';
import { Cursor } from '../../cursor';

suite('Byte Type', () => {
   const cursor = Cursor.create(new Uint8Array(16));
   test('should serialize and deserialize correctly', () => {
      const values = [0, 127, 255];
      for (const value of values) {
         cursor.pointer = 0;
         Byte.serialize(cursor, value);
         const c = cursor.pointer;
         cursor.pointer = 0;
         expect(Byte.deserialize(cursor)).toBe(value);
         expect(cursor.pointer).toBe(c);
      }
   });
});

suite('Short Type', () => {
   const cursor = Cursor.create(new Uint8Array(16));

   test('Signed', () => {
      const values = [0, 32767, -32768];
      for (const value of values) {
         cursor.pointer = 0;
         Short.serialize(cursor, value);
         const c = cursor.pointer;
         cursor.pointer = 0;
         expect(Short.deserialize(cursor)).toBe(value);
         expect(cursor.pointer).toBe(c);
      }
   });

   test('Unsigned', () => {
      const values = [0, 32767, 65535];
      for (const value of values) {
         cursor.pointer = 0;
         UShort.serialize(cursor, value);
         const c = cursor.pointer;
         cursor.pointer = 0;
         expect(UShort.deserialize(cursor)).toBe(value);
         expect(cursor.pointer).toBe(c);
      }
   });
});

suite('Int Type', () => {
   const cursor = Cursor.create(new Uint8Array(16));

   test('Signed', () => {
      const values = [0, 2147483647, -2147483648];
      for (const value of values) {
         cursor.pointer = 0;
         Int.serialize(cursor, value);
         const c = cursor.pointer;
         cursor.pointer = 0;
         expect(Int.deserialize(cursor)).toBe(value);
         expect(cursor.pointer).toBe(c);
      }
   });

   test('Unsigned', () => {
      const values = [0, 2147483647, 4294967295];
      for (const value of values) {
         cursor.pointer = 0;
         UInt.serialize(cursor, value);
         const c = cursor.pointer;
         cursor.pointer = 0;
         expect(UInt.deserialize(cursor)).toBe(value);
         expect(cursor.pointer).toBe(c);
      }
   });
});

suite('Long Type', () => {
   const cursor = Cursor.create(new Uint8Array(16));

   test('Signed', () => {
      const values = [0n, 9223372036854775807n, -9223372036854775808n];
      for (const value of values) {
         cursor.pointer = 0;
         Long.serialize(cursor, value);
         const c = cursor.pointer;
         cursor.pointer = 0;
         expect(Long.deserialize(cursor)).toBe(value);
         expect(cursor.pointer).toBe(c);
      }
   });

   test('Unsigned', () => {
      const values = [0n, 9223372036854775807n, 18446744073709551615n];
      for (const value of values) {
         cursor.pointer = 0;
         ULong.serialize(cursor, value);
         const c = cursor.pointer;
         cursor.pointer = 0;
         expect(ULong.deserialize(cursor)).toBe(value);
         expect(cursor.pointer).toBe(c);
      }
   });
});

suite('VarInt Type', () => {
   const cursor = Cursor.create(new Uint8Array(16));
   test('should serialize and deserialize correctly', () => {
      const values = [0, 127, 128, 16383, 16384, 2097151, 2097152, 268435455];
      for (const value of values) {
         cursor.pointer = 0;
         VarInt.serialize(cursor, value);
         const c = cursor.pointer;
         cursor.pointer = 0;
         expect(VarInt.deserialize(cursor)).toBe(value);
         expect(cursor.pointer).toBe(c);
      }
   });
});

suite('VarLong Type', () => {
   const cursor = Cursor.create(new Uint8Array(16));
   test('should serialize and deserialize correctly', () => {
      const values = [0n, 127n, 128n, 16383n, 16384n, 2097151n, 2097152n, 9223372036854775807n];
      for (const value of values) {
         cursor.pointer = 0;
         VarLong.serialize(cursor, value);
         const c = cursor.pointer;
         cursor.pointer = 0;
         expect(VarLong.deserialize(cursor)).toBe(value);
         expect(cursor.pointer).toBe(c);
      }
   });
});

suite('ZigZag Type', () => {
   const cursor = Cursor.create(new Uint8Array(16));
   test('should serialize and deserialize correctly', () => {
      const values = [0, -1, 1, -2, 2, 2147483647, -2147483648];
      for (const value of values) {
         cursor.pointer = 0;
         ZigZag.serialize(cursor, value);
         const c = cursor.pointer;
         cursor.pointer = 0;
         expect(ZigZag.deserialize(cursor)).toBe(value);
         expect(cursor.pointer).toBe(c);
      }
   });
});

suite('ZigZong Type', () => {
   const cursor = Cursor.create(new Uint8Array(16));
   test('should serialize and deserialize correctly', () => {
      const values = [0n, -1n, 1n, -2n, 2n, 9223372036854775807n, -9223372036854775808n];
      for (const value of values) {
         cursor.pointer = 0;
         ZigZong.serialize(cursor, value);
         const c = cursor.pointer;
         cursor.pointer = 0;
         expect(ZigZong.deserialize(cursor)).toBe(value);
         expect(cursor.pointer).toBe(c);
      }
   });
});
