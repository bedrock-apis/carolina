import { Cursor } from '../cursor';

export interface SerializableType<T, P extends unknown[] = []> {
   serialize(cursor: Cursor, value: T, ...params: P): void;
   deserialize(cursor: Cursor, ...params: P): T;
   inliner?: InlineSerializable;
   getIdentifier(...params: P): string;
}
export interface InlineSerializable {
   readonly inlineSerializableCode: (...params: unknown[]) => string;
   readonly inlineDeserializableCode: (...params: unknown[]) => string;
}
