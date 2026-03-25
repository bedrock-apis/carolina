import { SerializableType } from '@carolina/binary';

import { PacketIds } from '../enums';
import { PacketCodecType } from '../packet';

export type CodecPackets = Record<number, PacketCodecType>;
export type CodecTypes = Record<string, SerializableType<unknown>>;
export class Codec<P extends CodecPackets, T extends CodecTypes> {
   public readonly protocol: number;
   public readonly packets: P;
   public readonly types: T;
   protected constructor(proto: number, defs: P, types: T) {
      this.packets = defs;
      this.types = types;
      this.protocol = proto;
   }
   public expand<SP extends CodecPackets, ST extends CodecTypes>(
      proto: number,
      packetsExpander: SP,
      typesExpander: ST
   ): Codec<Omit<P, keyof SP> & SP, Omit<T, keyof ST> & ST> {
      // PACKETS
      const PACKETS_MAP: Record<string, PropertyDescriptor> = {};
      for (const key of Object.getOwnPropertyNames(this.packets)) {
         PACKETS_MAP[key] = {
            configurable: false,
            enumerable: true,
            writable: false,
            value: this.packets[key as keyof P],
         };
      }
      for (const key of Object.getOwnPropertyNames(packetsExpander)) {
         PACKETS_MAP[key] = {
            configurable: false,
            enumerable: true,
            writable: false,
            value: packetsExpander[key as keyof typeof packetsExpander],
         };
      }

      // TYPES
      const TYPES_MAP: Record<string, PropertyDescriptor> = {};
      for (const key of Object.getOwnPropertyNames(this.types)) {
         TYPES_MAP[key] = {
            configurable: false,
            enumerable: true,
            writable: false,
            value: this.types[key as keyof T],
         };
      }
      for (const key of Object.getOwnPropertyNames(typesExpander)) {
         TYPES_MAP[key] = {
            configurable: false,
            enumerable: true,
            writable: false,
            value: typesExpander[key as keyof typeof typesExpander],
         };
      }

      // CREATE
      return new Codec(
         proto,
         Object.create(null, PACKETS_MAP),
         Object.create(null, TYPES_MAP)
      ) as unknown as Codec<Omit<P, keyof SP> & SP, Omit<T, keyof ST> & ST>;
   }
   public *GetPacketsKeysIterator(): Generator<string> {
      for (const key in this.packets) yield key;
   }
   public *GetTypesKeysIterator(): Generator<string> {
      for (const key in this.packets) yield key;
   }
   public static create<P extends CodecPackets, T extends CodecTypes>(
      proto: number,
      codec: P,
      types: T
   ): Codec<P, T> {
      return new this(
         proto,
         Object.create(null, Object.getOwnPropertyDescriptors(codec)),
         Object.create(null, Object.getOwnPropertyDescriptors(types))
      );
   }
   public getPacketCodec<I extends PacketIds>(packetId: I): I extends keyof P ? P[I] : PacketCodecType | null;
   public getPacketCodec(packetId: number): PacketCodecType | null {
      return this.packets[packetId] ?? null;
   }
   public getTypeCodec<I extends string>(
      name: I
   ): I extends keyof T ? T[I] : SerializableType<unknown> | null;
   public getTypeCodec(name: string): SerializableType<unknown> | null {
      return this.types[name] ?? null;
   }
}
