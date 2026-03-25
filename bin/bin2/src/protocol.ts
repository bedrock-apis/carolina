import { codec, PROTOCOL_VERSION } from './codecs/944';
export { codec, PROTOCOL_VERSION };
export type CodecPacketsSerializers = (typeof codec)['packets'];
export type CodecPackets = { [k in keyof CodecPacketsSerializers]: InstanceType<CodecPacketsSerializers[k]> };
export const CodecPacketsSerializers: CodecPacketsSerializers = codec.packets;

export type CodecTypesSerializers = (typeof codec)['types'];
export type CodecTypes = { [k in keyof CodecTypesSerializers]: InstanceType<CodecTypesSerializers[k]> };
export const CodecTypesSerializers: CodecTypesSerializers = codec.types;
