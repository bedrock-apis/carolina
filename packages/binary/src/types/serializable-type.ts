import { Cursor } from "../cursor";

export interface SerializableType<T> {
    serialize(cursor: Cursor, value: T): void;
    deserialize(cursor: Cursor): T;
}
export interface InlineSerializable {
    readonly inlineSerializableCode: (...params: unknown[])=>string;
    readonly inlineDeserializableCode: (...params: unknown[])=>string;
}