import { codec as oldCodec } from '../944';

export const PROTOCOL_VERSION = 935;
export const codec = oldCodec.expand(PROTOCOL_VERSION, {}, {});
