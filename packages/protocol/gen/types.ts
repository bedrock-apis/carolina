import { NumberEncoding, PrimitiveType } from './enums';

export interface ProtocolInfoRoot {
   'minecraft-engine': string;
   'protocol-version': number;
   includes: { packets: string; structs: string; enums: string };
}
export interface ProtocolIdentity {
   name: string;
}
export interface ProtocolDescriptiveIdentity extends ProtocolIdentity {
   description?: string;
}
export interface ProtocolField extends ProtocolDescriptiveIdentity {
   type: ProtocolType;
}
export interface ProtocolType extends ProtocolIdentity {
   family: 'primitive' | 'enum' | 'struct';
}

export interface ProtocolPrimitiveType extends ProtocolType {
   family: 'primitive';
   name: PrimitiveType | string;
   encoding?: NumberEncoding | string;
   'length-type'?: ProtocolType;
   'value-type'?: ProtocolType;
}

export interface ProtocolStruct extends ProtocolDescriptiveIdentity {
   fields: ProtocolField[];
}

export interface ProtocolPacket extends ProtocolStruct {
   'packet-id': number;
}

export interface ProtocolEnum extends ProtocolDescriptiveIdentity {
   entries: Record<string, unknown>;
   'bit-flags'?: boolean;
   primitive: ProtocolPrimitiveType;
}
