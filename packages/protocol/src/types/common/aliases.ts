import { VarUint64, ZigZag32, ZigZag64 } from '@carolina/binary';

/**
 * Common protocol type aliases
 */
export const GameModeType = ZigZag32;
export const EntityIdType = ZigZag64;
export const EntityRuntimeIdType = VarUint64;
export const PlayerInputTickType = VarUint64;
