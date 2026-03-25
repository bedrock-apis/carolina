import { AbstractType, Compilable, Cursor, SerializableType, VarInt32 } from '@carolina/binary';
import { InjectAsNoEnumerableStruct } from '@carolina/common';

import { PacketIds } from './enums/packet-ids';

type Mutable<T> = { -readonly [k in keyof T]: T[k] };
export interface PacketCodecType {
   new (): PacketType;
   readonly packetId: number;
   deserialize<T extends AbstractType>(this: new () => T, _cursor: Cursor<ArrayBufferLike>): T;
   serialize<T extends AbstractType>(this: new () => T, _cursor: Cursor, _value: T): void;
   getIdentifier(this: new () => AbstractType): string;
}
export abstract class PacketType extends AbstractType {
   public static readonly packetId: number = -1;
   public getPacketId(): number {
      return (this.constructor as typeof PacketType).packetId;
   }
   public getType<P extends PacketType>(this: P): SerializableType<P> {
      return this.constructor as unknown as SerializableType<P>;
   }
   /**
    * This methods also serializes the packet prefixed by its packetId
    */
   public serialize(cursor: Cursor): void {
      VarInt32.serialize(cursor, this.getPacketId());
      return void this.getType().serialize(cursor, this);
   }
}

export function PacketCompilable(packetId: PacketIds): <T extends { new (): PacketType }>(target: T) => void {
   return <T extends { new (): PacketType }>(target: T): void => {
      (target as unknown as Mutable<typeof PacketType>).packetId = packetId;
      Compilable(target);
   };
}
export function ManualImplement<T extends new () => S, S>(
   target: T,
   packetId: number,
   type: Omit<SerializableType<S>, 'getIdentifier'>
): void {
   (type as Mutable<typeof PacketType>).packetId = packetId;
   InjectAsNoEnumerableStruct(target, type as never);
}
