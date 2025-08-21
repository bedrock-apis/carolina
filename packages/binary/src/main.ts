import { Cursor } from './cursor';
import { Compilable, Marshal } from './decorators';
import { AbstractType } from './decorators/abstract-type';
import { VarInt } from './types';
import { Uint24 } from './types/numbers/uint24';

export { Cursor } from './cursor';
export * from './types';

@Compilable
export class TestBinary extends AbstractType {
   @Marshal(Uint24)
   public readonly test: number = 0;
   @Marshal(VarInt)
   public readonly notInlined: number = 0;
}

console.log(TestBinary.deserialize.toString());

console.log(TestBinary.serialize.toString());
const cursor = new Cursor(new Uint8Array(541));
console.log(TestBinary.deserialize(cursor).test);
console.log(cursor.pointer);
