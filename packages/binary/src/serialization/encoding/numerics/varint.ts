import { InjectAsNoEnumerableStruct } from '@carolina/common';

import { VALUE_TYPE_CONSTRUCTOR_FACTORY, ValueTypeConstructor } from '../value-type';
import { NumberType } from './common-number-type';

export interface VarUint32 extends NumberType<number> {}
export const VarUint32: ValueTypeConstructor<VarUint32, number> = VALUE_TYPE_CONSTRUCTOR_FACTORY(
   'VarUint32',
   0,
   NumberType
) as ValueTypeConstructor<VarUint32, number>;

InjectAsNoEnumerableStruct(VarUint32, {
   deserialize(cursor) {
      const pointer = cursor.pointer;
      for (let i = pointer, shift = 0, num = 0; i < pointer + 5; i++, shift += 7) {
         const byte = cursor.buffer[i];
         num |= (byte & 0x7f) << shift;
         if ((byte & 0x80) === 0) return ((cursor.pointer = i + 1), num >>> 0);
      }
      throw new Error('VarUint32 too long: exceeds 5 bytes');
   },
   serialize(cursor, value) {
      value >>>= 0;
      for (let i = 0; i < 5; i++) {
         if ((value & ~0x7f) === 0) return void (cursor.buffer[cursor.pointer++] = value);
         cursor.buffer[cursor.pointer++] = (value & 0x7f) | 0x80;
         value >>>= 7;
      }
   },
});

export interface VarInt32 extends NumberType<number> {}
export const VarInt32: ValueTypeConstructor<VarInt32, number> = VALUE_TYPE_CONSTRUCTOR_FACTORY(
   'VarInt32',
   0,
   NumberType
) as ValueTypeConstructor<VarInt32, number>;

InjectAsNoEnumerableStruct(VarInt32, {
   deserialize(cursor) {
      const pointer = cursor.pointer;
      for (let i = pointer, shift = 0, num = 0; i < pointer + 5; i++, shift += 7) {
         const byte = cursor.buffer[i];
         if (shift < 32) {
            num |= (byte & 0x7f) << shift;
         }
         if ((byte & 0x80) === 0) return ((cursor.pointer = i + 1), num | 0);
      }
      throw new Error('VarInt32 too long: exceeds 5 bytes');
   },
   serialize(cursor, value) {
      value |= 0;
      let v = value >>> 0;
      for (let i = 0; i < 5; i++) {
         if ((v & ~0x7f) === 0) return void (cursor.buffer[cursor.pointer++] = v);
         cursor.buffer[cursor.pointer++] = (v & 0x7f) | 0x80;
         v >>>= 7;
      }
   },
});

export interface VarUint64 extends NumberType<bigint> {}
export const VarUint64: ValueTypeConstructor<VarUint64, bigint> = VALUE_TYPE_CONSTRUCTOR_FACTORY(
   'VarUint64',
   0n,
   NumberType
) as ValueTypeConstructor<VarUint64, bigint>;

InjectAsNoEnumerableStruct(VarUint64, {
   deserialize(cursor) {
      const pointer = cursor.pointer;
      for (let i = pointer, shift = 0n, num = 0n; i < pointer + 10; i++, shift += 7n) {
         const byte = cursor.buffer[i];
         num |= (BigInt(byte) & 0x7fn) << shift;
         if ((byte & 0x80) === 0) return ((cursor.pointer = i + 1), num);
      }
      throw new Error('VarUint64 too long: exceeds 10 bytes');
   },
   serialize(cursor, value) {
      for (let i = 0; i < 10; i++) {
         if ((value & ~0x7fn) === 0n) return void (cursor.buffer[cursor.pointer++] = Number(value));
         cursor.buffer[cursor.pointer++] = Number((value & 0x7fn) | 0x80n);
         value >>= 7n;
      }
   },
});
