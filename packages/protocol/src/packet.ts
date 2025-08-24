import { AbstractType, Compilable } from '@carolina/binary';
import { PacketIds } from './enums/packet-ids';

type Mutable<T> = { -readonly [k in keyof T]: T[k] };
export abstract class PacketType extends AbstractType {
   public static readonly packetId: number = -1;
   public getPacketId(): number {
      return (this.constructor as typeof PacketType).packetId;
   }
}

export function PacketCompilable(packetId: PacketIds): <T extends { new (): PacketType }>(target: T) => void {
   return <T extends { new (): PacketType }>(target: T): void => {
      (target as unknown as Mutable<typeof PacketType>).packetId = packetId;
      Compilable(target);
   };
}
