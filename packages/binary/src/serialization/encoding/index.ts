import { String } from './complex';
import { VarUint32 } from './numerics';

export * from './abstract-type';
export * from './common';
export * from './numerics';
export * from './complex';

export const VarString = String(VarUint32);
