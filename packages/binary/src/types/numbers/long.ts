import { generateStaticTypeWithEndianness, StaticSizedNumber, StaticSizedNumberConstructor } from './static-endianness';

export interface LongConstructor extends StaticSizedNumberConstructor<bigint> {}
export const Long: LongConstructor = generateStaticTypeWithEndianness('Long', 0n, 8, 'setBigInt64', 'getBigInt64');
export interface Long extends StaticSizedNumber<bigint> {}

export interface ULongConstructor extends StaticSizedNumberConstructor<bigint> {}
export const ULong: ULongConstructor = generateStaticTypeWithEndianness('ULong', 0n, 8, 'setBigUint64', 'getBigUint64');
export interface ULong extends StaticSizedNumber<bigint> {}
