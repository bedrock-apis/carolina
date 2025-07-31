import { Cursor } from "@carolina/binary";
import { } from "@bedrock-apis/nbt-core";
export interface ISerializableType<T = unknown> {
    serialize(cursor: Cursor, value: T): void;
    deserialize(cursor: Cursor): T;
}
export abstract class Serializable {
    public deserialize(_: Cursor): this {
        // Intended to not be implemented implementation is override after via decorators
        throw new ReferenceError("No implementation error");
    }
    public serialize(_: Cursor): void {
        // Intended to not be implemented implementation is override after via decorators
        throw new ReferenceError("No implementation error");
    }
}
export abstract class BasePacket extends Serializable { }
export enum BuildIn {
    Byte,
    Boolean,
    Int16,
    Uint16,
    Int32,
    Uint32,
    Float32,
    Float64,
    BigInt64,
    BigUint64,
    VarUint32,
    VarBigUint64,
    ZigZag32,
    ZigZag64,
    String32,
    StringVar,
    StringZigZag,
    BigEndian = 0x80, //Upper byte for big endian
}

export function Marshal(type: Serializable | BuildIn): <T extends Serializable>(target: T, property: string | symbol) => void {
    return (target, property) => {
        //OK lets do that later on right
        console.log(target, property);
    }
};