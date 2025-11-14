import { SerializableType } from '@carolina/binary';
import { PacketType } from '@carolina/protocol';
import { NetworkConnection } from '../network/connection';
export const HANDLERS: Record<
   number,
   { type: SerializableType<PacketType>; handler: (packetType: PacketType, connection: NetworkConnection) => void }
> = {};
export function registerHandlers<
   T extends { readonly packetId: number; new (): PacketType } & SerializableType<PacketType>,
>(ctor: T, handler: (packet: T extends new () => infer P ? P : never, connection: NetworkConnection) => void): void {
   HANDLERS[ctor.packetId] = { type: ctor, handler: handler as any };
}
