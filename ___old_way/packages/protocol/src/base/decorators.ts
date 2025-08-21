import { SerializableType } from "@carolina/binary";
import { BasePacket } from "./packet";
import { BaseType } from "./type";

interface PropertyMarshalInfo {
    key: string;
    type: SerializableType<unknown>;
    condition?: string;
}
const METADATA_MAP = new WeakMap<BaseType, Map<string, PropertyMarshalInfo>>();
export function Marshal(type: SerializableType<unknown>): <T extends BaseType>(target: T, property: string) => void {
    return (target, property) => {
        const data = METADATA_MAP.get(target) ?? new Map;
        const v: PropertyMarshalInfo = data.get(property) ?? {};
        v.key = property;
        v.type = type;
        data.set(property, v);
        METADATA_MAP.set(target, data);
    }
};
export function Serializable<T extends new () => BaseType>(target: T): void {
    console.log(target);
    console.log(METADATA_MAP.get(target.prototype)?.values().toArray());
};


export enum Endianness {
    Big,
    Little
}
export function EndianOrder(endianness: Endianness): (target: BasePacket, property: string) => void {
    return (target)=>{

    }
};