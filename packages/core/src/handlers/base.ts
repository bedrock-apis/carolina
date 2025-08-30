import { SerializableType } from '@carolina/binary';
import { PacketType } from '@carolina/protocol';
import { CarolinaConnection } from '../network/connection';
export const HANDLERS: Record<
   number,
   { type: SerializableType<PacketType>; handler: (packetType: PacketType, connection: CarolinaConnection) => void }
> = {};
export function registerHandler<
   T extends { readonly packetId: number; new (): PacketType } & SerializableType<PacketType>,
>(ctor: T, handler: (packet: T extends new () => infer P ? P : never, connection: CarolinaConnection) => void): void {
   HANDLERS[ctor.packetId] = { type: ctor, handler: handler as any };
}
