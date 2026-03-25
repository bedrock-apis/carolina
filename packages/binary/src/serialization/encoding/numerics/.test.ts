import { expect, suite, test } from 'vitest';

import {
   Int16,
   Int32,
   Int64,
   Uint32,
   Uint8,
   Uint16,
   Uint64,
   ZigZag32,
   ZigZag64,
   VarUint32,
   VarUint64,
} from '.';
import { Cursor } from '../../../cursor';

suite('Byte Type', () => {
   const cursor = Cursor.create(new Uint8Array(16));
   test('should serialize and deserialize correctly', () => {
      const values = [0, 127, 255];
      for (const value of values) {
         cursor.pointer = 0;
         Uint8.serialize(cursor, value);
         const c = cursor.pointer;
         cursor.pointer = 0;
         expect(Uint8.deserialize(cursor)).toBe(value);
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
         Int16.serialize(cursor, value);
         const c = cursor.pointer;
         cursor.pointer = 0;
         expect(Int16.deserialize(cursor)).toBe(value);
         expect(cursor.pointer).toBe(c);
      }
   });

   test('Unsigned', () => {
      const values = [0, 32767, 65535];
      for (const value of values) {
         cursor.pointer = 0;
         Uint16.serialize(cursor, value);
         const c = cursor.pointer;
         cursor.pointer = 0;
         expect(Uint16.deserialize(cursor)).toBe(value);
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
         Int32.serialize(cursor, value);
         const c = cursor.pointer;
         cursor.pointer = 0;
         expect(Int32.deserialize(cursor)).toBe(value);
         expect(cursor.pointer).toBe(c);
      }
   });

   test('Unsigned', () => {
      const values = [0, 2147483647, 4294967295];
      for (const value of values) {
         cursor.pointer = 0;
         Uint32.serialize(cursor, value);
         const c = cursor.pointer;
         cursor.pointer = 0;
         expect(Uint32.deserialize(cursor)).toBe(value);
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
         Int64.serialize(cursor, value);
         const c = cursor.pointer;
         cursor.pointer = 0;
         expect(Int64.deserialize(cursor)).toBe(value);
         expect(cursor.pointer).toBe(c);
      }
   });

   test('Unsigned', () => {
      const values = [0n, 9223372036854775807n, 18446744073709551615n];
      for (const value of values) {
         cursor.pointer = 0;
         Uint64.serialize(cursor, value);
         const c = cursor.pointer;
         cursor.pointer = 0;
         expect(Uint64.deserialize(cursor)).toBe(value);
         expect(cursor.pointer).toBe(c);
      }
   });
});

suite('VarUint32 Type', () => {
   const cursor = Cursor.create(new Uint8Array(16));
   test('should serialize and deserialize correctly', () => {
      const values = [0, 127, 128, 16383, 16384, 2097151, 2097152, 268435455];
      for (const value of values) {
         cursor.pointer = 0;
         VarUint32.serialize(cursor, value);
         const c = cursor.pointer;
         cursor.pointer = 0;
         expect(VarUint32.deserialize(cursor)).toBe(value);
         expect(cursor.pointer).toBe(c);
      }
   });
});

suite('VarUint64 Type', () => {
   const cursor = Cursor.create(new Uint8Array(16));
   test('should serialize and deserialize correctly', () => {
      const values = [0n, 127n, 128n, 16383n, 16384n, 2097151n, 2097152n, 9223372036854775807n];
      for (const value of values) {
         cursor.pointer = 0;
         VarUint64.serialize(cursor, value);
         const c = cursor.pointer;
         cursor.pointer = 0;
         expect(VarUint64.deserialize(cursor)).toBe(value);
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
         ZigZag32.serialize(cursor, value);
         const c = cursor.pointer;
         cursor.pointer = 0;
         expect(ZigZag32.deserialize(cursor)).toBe(value);
         expect(cursor.pointer).toBe(c);
      }
   });
});

suite('ZigZag64 Type', () => {
   const cursor = Cursor.create(new Uint8Array(16));
   test('should serialize and deserialize correctly', () => {
      const values = [0n, -1n, 1n, -2n, 2n, 9223372036854775807n, -9223372036854775808n];
      for (const value of values) {
         cursor.pointer = 0;
         ZigZag64.serialize(cursor, value);
         const c = cursor.pointer;
         cursor.pointer = 0;
         expect(ZigZag64.deserialize(cursor)).toBe(value);
         expect(cursor.pointer).toBe(c);
      }
   });
});
