import {
   generateStaticTypeWithEndianness,
   StaticSizedNumber,
   StaticSizedNumberConstructor,
} from './common-endianness';

export interface Float16Constructor extends StaticSizedNumberConstructor<number> {}
export interface Float16 extends StaticSizedNumber<number> {}
export const Float16: Float16Constructor = generateStaticTypeWithEndianness('Float16', 0, 2);

export interface Float32Constructor extends StaticSizedNumberConstructor<number> {}
export interface Float32 extends StaticSizedNumber<number> {}
export const Float32: Float32Constructor = generateStaticTypeWithEndianness('Float32', 0, 4);

export interface Float64Constructor extends StaticSizedNumberConstructor<number> {}
export interface Float64 extends StaticSizedNumber<number> {}
export const Float64: Float64Constructor = generateStaticTypeWithEndianness('Float64', 0, 8);
