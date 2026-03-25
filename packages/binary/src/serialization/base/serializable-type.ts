import { Cursor } from '../../cursor';

export interface SerializableType<T, P extends unknown[] = []> {
   serialize(cursor: Cursor, value: T, ...params: P): void;
   deserialize(cursor: Cursor, ...params: P): T;
   getIdentifier(...params: P): string;
}
