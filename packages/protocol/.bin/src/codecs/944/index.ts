import { PacketIds } from '../../enums';
import { codec as legacy } from '../924';
import { StartGamePacket } from './packets/start-game';
import * as TYPES from './types';
export const PROTOCOL_VERSION = 944;
export const codec = legacy.expand(PROTOCOL_VERSION, { [PacketIds.StartGame]: StartGamePacket }, TYPES);
