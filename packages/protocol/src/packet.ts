import { AbstractType, Compilable, mergeSourceDirectNoEnumerable, SerializableType } from '@carolina/binary';
import { PacketIds } from './enums/packet-ids';

type Mutable<T> = { -readonly [k in keyof T]: T[k] };
export abstract class PacketType extends AbstractType {
   public static readonly packetId: number = -1;
   public getPacketId(): number {
      return (this.constructor as typeof PacketType).packetId;
   }
   public getType<P extends PacketType>(this: P): SerializableType<P> {
      return this.constructor as unknown as SerializableType<P>;
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
   type: Omit<SerializableType<S>, 'getIdentifier'>,
): void {
   (type as Mutable<typeof PacketType>).packetId = packetId;
   mergeSourceDirectNoEnumerable(target, type as any);
}
