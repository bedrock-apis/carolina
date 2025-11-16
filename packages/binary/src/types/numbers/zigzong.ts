import { Cursor } from '../../cursor';
import { mergeSourceDirectNoEnumerable, VALUE_TYPE_CONSTRUCTOR_FACTORY, ValueTypeConstructor } from '../base';
import { NumberType } from '../number-type';

export interface ZigZongConstructor extends ValueTypeConstructor<ZigZong, bigint> {
   encode(value: bigint): bigint;
   decode(value: bigint): bigint;
}

export const ZigZong: ZigZongConstructor = VALUE_TYPE_CONSTRUCTOR_FACTORY(
   'ZigZong',
   0n,
   NumberType,
) as ZigZongConstructor;
export interface ZigZong extends NumberType<bigint> {}

mergeSourceDirectNoEnumerable(ZigZong, {
   deserialize: function deserialize(cursor: Cursor): bigint {
      for (let i = 0, shift = 0n, num = 0n; i < 10; i++, shift += 7n) {
         const byte = BigInt(cursor.buffer[cursor.pointer++]);
         num |= (byte & 0x7fn) << shift;
         if ((byte & 0x80n) === 0n) return (num >> 1n) ^ -(num & 1n);
      }
      throw new Error('ZigZong too long: exceeds 10 bytes');
   },
   serialize: function serialize(cursor: Cursor, value: bigint): void {
      value = (value << 1n) ^ (value >> 63n);
      for (let i = 0; i < 10; i++) {
         if ((value & ~0x7fn) === 0n) return void (cursor.buffer[cursor.pointer++] = Number(value));
         cursor.buffer[cursor.pointer++] = Number((value & 0x7fn) | 0x80n);
         value >>= 7n;
      }
   },
   encode: function encode(n: bigint): bigint {
      return (n << 1n) ^ (n >> 63n);
   },
   decode: function decode(n: bigint): bigint {
      return (n >> 1n) ^ -(n & 1n);
   },
});
