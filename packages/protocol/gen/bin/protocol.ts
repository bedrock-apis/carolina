import type { ProtocolEnum, ProtocolPacket, ProtocolStruct } from './types';

export class Protocol {
   public readonly structs: Map<string, ProtocolStruct> = new Map();
   public readonly packets: Map<string, ProtocolPacket> = new Map();
   public readonly enums: Map<string, ProtocolEnum> = new Map();
}
