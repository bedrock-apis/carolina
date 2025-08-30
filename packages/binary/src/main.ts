import { Int, Str, VarInt } from './types';

export * from './cursor';
export * from './types';
export * from './decorators';

export const String32LE = Str(Int, true);
export const String32BE = Str(Int, false);
export const VarString = Str(VarInt);
