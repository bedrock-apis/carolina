import { generateStaticTypeWithEndianness, StaticSizedNumber, StaticSizedNumberConstructor } from './static-endianness';

export interface FloatConstructor extends StaticSizedNumberConstructor<number> {}
export const Float: FloatConstructor = generateStaticTypeWithEndianness('Float', 0, 4, 'setFloat32', 'getFloat32');
export interface Float extends StaticSizedNumber<number> {}

export interface DoubleConstructor extends StaticSizedNumberConstructor<number> {}
export const Double: DoubleConstructor = generateStaticTypeWithEndianness('Double', 0, 8, 'setFloat64', 'getFloat64');
export interface Double extends StaticSizedNumber<number> {}
