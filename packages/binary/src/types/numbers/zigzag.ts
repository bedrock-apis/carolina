import { Cursor } from "../../cursor";
import { mergeSourceDirectNoEnumerable, VALUE_TYPE_CONSTRUCTOR_FACTORY, ValueTypeConstructor } from "../base";
import { NumberType } from "../number-type";

export interface ZigZagConstructor extends ValueTypeConstructor<ZigZag, number> {
    encode(value: number): number;
    decode(value: number): number;
}

export const ZigZag: ZigZagConstructor = VALUE_TYPE_CONSTRUCTOR_FACTORY("ZigZag", 0, NumberType) as ZigZagConstructor;
export interface ZigZag extends NumberType<number> { }

mergeSourceDirectNoEnumerable(ZigZag, {
    deserialize: function deserialize(cursor: Cursor): number {
        for (let i = 0, shift = 0, num = 0; i < 5; i++, shift += 7) {
            const byte = cursor.buffer[cursor.pointer++];
            num |= (byte & 0x7F) << shift;
            if ((byte & 0x80) === 0) return (num >>> 1) ^ -(num & 1);
        }
        throw new Error("ZigZag32 too long: exceeds 5 bytes");
    },
    serialize: function serialize(cursor: Cursor, value: number): void {
        value = (value << 1) ^ (value >> 31);
        for (let i = 0; i < 5; i++) {
            if ((value & ~0x7F) === 0) return void (cursor.buffer[cursor.pointer++] = value);
            cursor.buffer[cursor.pointer++] = (value & 0x7F) | 0x80;
            value >>>= 7;
        }
    },
    encode: function encode(n: number): number { return (n << 1) ^ (n >> 31); },
    decode: function decode(n: number): number { return (n >>> 1) ^ -(n & 1); }
});