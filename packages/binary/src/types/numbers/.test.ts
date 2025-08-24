import { expect, suite, test } from 'vitest';
import { Byte, Int, Long, Short, Uint24, VarInt, VarLong, ZigZag, ZigZong } from '.';
import { Cursor } from '../../cursor';
const NUMBER_TYPES = [Byte, Short, Int, VarInt, ZigZag, Uint24];
const NUMBER_LONG_TYPES = [Long, VarLong, ZigZong];

suite('Number Types', () => {
   const cursor = new Cursor(new Uint8Array(16));
   for (const type of NUMBER_TYPES) {
      test(type.name, () => {
         for (let i = 0; i < 100; i++) {
            cursor.pointer = 0;
            const value = ~~(Math.random() * 255);
            type.serialize(cursor, value);
            let c = cursor.pointer;
            cursor.pointer = 0;
            expect(type.deserialize(cursor)).toBe(value);
            expect(cursor.pointer).toBe(c);
         }
      });
   }
   for (const type of NUMBER_LONG_TYPES) {
      test(type.name, () => {
         for (let i = 0; i < 100; i++) {
            cursor.pointer = 0;
            const value = BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)) - 90071992547409n;
            type.serialize(cursor, value);
            let c = cursor.pointer;
            cursor.pointer = 0;
            expect(type.deserialize(cursor)).toBe(value);
            expect(cursor.pointer).toBe(c);
         }
      });
   }
});
