import { generateStaticTypeWithEndianness, StaticSizedNumber, StaticSizedNumberConstructor } from "./static-endianness";

export interface ShortConstructor extends StaticSizedNumberConstructor<number>{}
export const Short: ShortConstructor = generateStaticTypeWithEndianness("Short", 0, 2, "setInt16", "getInt16");
export interface Short extends StaticSizedNumber<number> { }


export interface UShortConstructor extends StaticSizedNumberConstructor<number>{}
export const UShort: UShortConstructor = generateStaticTypeWithEndianness("UShort", 0, 2, "setUint16", "getUint16");
export interface UShort extends StaticSizedNumber<number> { }