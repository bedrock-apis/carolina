import { generateStaticTypeWithEndianness, StaticSizedNumber, StaticSizedNumberConstructor } from "./static-endianness";

export interface IntConstructor extends StaticSizedNumberConstructor<number>{}
export const Int: IntConstructor = generateStaticTypeWithEndianness("Int", 0, 4, "setInt32", "getInt32");
export interface Int extends StaticSizedNumber<number> { }


export interface UIntConstructor extends StaticSizedNumberConstructor<number>{}
export const UInt: UIntConstructor = generateStaticTypeWithEndianness("UInt", 0, 4, "setUint32", "getUint32");
export interface UInt extends StaticSizedNumber<number> { }