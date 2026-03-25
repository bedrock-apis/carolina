import { InjectAsNoEnumerableStruct } from '@carolina/common';

import { EncodingCompilable, OutputKind } from '../../compiler';
import { VALUE_TYPE_CONSTRUCTOR_FACTORY, ValueTypeConstructor } from '../value-type';
import {
   generateStaticTypeWithEndianness,
   StaticSizedNumber,
   StaticSizedNumberConstructor,
} from './common-endianness';
import { NumberType } from './common-number-type';

// Uint8
export interface Uint8Constructor extends ValueTypeConstructor<Uint8, number>, EncodingCompilable {}
export interface Uint8 extends NumberType<number> {}
export const Uint8: Uint8Constructor = VALUE_TYPE_CONSTRUCTOR_FACTORY(
   'Uint8',
   0,
   NumberType
) as Uint8Constructor;

// Code
InjectAsNoEnumerableStruct(Uint8, {
   deserialize(cursor) {
      return cursor.view.getUint8(cursor.pointer++);
   },
   serialize(cursor, value) {
      cursor.view.setUint8(cursor.pointer++, value);
   },
   compile(context) {
      const [cursor] = context.environments;
      const { input } = context.getStrategy();
      return {
         serialization: `${cursor}.view.setUint8(${cursor}.pointer++,${input})`,
         deserialization: `${cursor}.view.getUint8(${cursor}.pointer++)`,
         kind: OutputKind.BareBone,
      };
   },
});

//16
export interface Int16Constructor extends StaticSizedNumberConstructor<number> {}
export interface Int16 extends StaticSizedNumber<number> {}
export const Int16: Int16Constructor = generateStaticTypeWithEndianness('Int16', 0, 2);

export interface Uint16Constructor extends StaticSizedNumberConstructor<number> {}
export interface Uint16 extends StaticSizedNumber<number> {}
export const Uint16: Uint16Constructor = generateStaticTypeWithEndianness('Uint16', 0, 2);

//32
export interface Int32Constructor extends StaticSizedNumberConstructor<number> {}
export interface Int32 extends StaticSizedNumber<number> {}
export const Int32: Int32Constructor = generateStaticTypeWithEndianness('Int32', 0, 4);

export interface Uint32Constructor extends StaticSizedNumberConstructor<number> {}
export interface Uint32 extends StaticSizedNumber<number> {}
export const Uint32: Uint32Constructor = generateStaticTypeWithEndianness('Uint32', 0, 4);

//64
export interface BigInt64Constructor extends StaticSizedNumberConstructor<bigint> {}
export interface BigInt64 extends StaticSizedNumber<bigint> {}
export const BigInt64: BigInt64Constructor = generateStaticTypeWithEndianness('BigInt64', 0n, 8);

export interface BigUint64Constructor extends StaticSizedNumberConstructor<bigint> {}
export interface BigUint64 extends StaticSizedNumber<bigint> {}
export const BigUint64: BigUint64Constructor = generateStaticTypeWithEndianness('BigUint64', 0n, 8);

export const Int64 = BigInt64,
   Uint64 = BigUint64;
