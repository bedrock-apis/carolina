
import { Cursor } from "../../cursor";
import { mergeSourceDirectNoEnumerable, VALUE_TYPE_CONSTRUCTOR_FACTORY, ValueTypeConstructor } from "../base";
import { NumberType } from "../number-type";
import { InlineSerializable } from "../serializable-type";

const {defineProperty} = Reflect;

export interface StaticSizedNumberConstructor<T extends number | bigint> extends ValueTypeConstructor<StaticSizedNumber<T>, T>, InlineSerializable {
    deserialize(cursor: Cursor, littleEndian?: boolean): T;
    serialize(cursor: Cursor, value: T, littleEndian?: boolean): void;
}
export interface StaticSizedNumber<T extends number | bigint> extends NumberType<T> { };
type DataViewSetMethodKey = {[K in keyof DataView]: K extends `set${string}` ? K : never}[keyof DataView];
type DataViewGetMethodKey =  {[K in keyof DataView]: K extends `get${string}` ? K : never}[keyof DataView];

//TODO - Check if that even works
export function generateStaticTypeWithEndianness<T extends number | bigint, S extends DataViewSetMethodKey, G extends DataViewGetMethodKey>
        (name: string, defaultValue: T, sizeOf: number, setMethod: S, getMethod: G): StaticSizedNumberConstructor<T> {
    const $ = VALUE_TYPE_CONSTRUCTOR_FACTORY(name, defaultValue, NumberType);

    mergeSourceDirectNoEnumerable($, {
        deserialize: createDeserializeFunction(getMethod as string, sizeOf),
        serialize: createSerializeFunction(setMethod as string, sizeOf),
        inlineDeserializableCode: ($1: unknown)=>createInlineDeserialize(getMethod as string, sizeOf, $1),
        inlineSerializableCode: ($0: unknown, $1: unknown)=>createInlineSerialize(getMethod as string, $0 as string, sizeOf, $1),
    });


    return $ as any;
}

const cursorVariableName = "$";
const valueVariableName = "_";
const endiannessVariableName = "$1";
type CursorKey = keyof Cursor;

function createSerializeFunction(setViewMethod: string, sizeOf: number): (cursor: Cursor, value: number | bigint, littleEndian?: boolean)=>void{
    const $ = Function(cursorVariableName,
        valueVariableName,
        endiannessVariableName,
        createInlineSerialize(setViewMethod, valueVariableName, sizeOf, endiannessVariableName)
    );
    defineProperty($, "name", {
        configurable: true,
        enumerable: false,
        writable: false,
        value: "serialize"
    });
    return $ as any;
}

function createDeserializeFunction(getViewMethod: string, sizeOf: number): (cursor: Cursor, littleEndian?: boolean)=>number | bigint {
    const $ = Function(cursorVariableName, endiannessVariableName,
`const _ = ${createInlineDeserialize(getViewMethod, sizeOf, endiannessVariableName)};
return _;`);
    defineProperty($, "name", {
        configurable: true,
        enumerable: false,
        writable: false,
        value: "deserialize"
    });
    return $ as any;
}

function createInlineSerialize(setMethod: string, value: string, sizeOf: number, endianness: unknown): string{
    return `$.${"view" satisfies CursorKey}.${setMethod}($.${"pointer" satisfies CursorKey}, ${value}, ${endianness}); $.${"pointer" satisfies CursorKey}+=${sizeOf}`;
}
function createInlineDeserialize(getMethod: string, sizeOf: number, endianness: unknown): string{
    return `$.${"view" satisfies CursorKey}.${getMethod}($.${"pointer" satisfies CursorKey}, ${endianness}); $.${"pointer" satisfies CursorKey}+=${sizeOf}`;
}