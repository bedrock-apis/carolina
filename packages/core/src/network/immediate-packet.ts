import { PacketType } from '@carolina/protocol';

export class CachedImmediateMessage {
   public readonly packet: PacketType;
   public readonly packetId: number;
   public constructor(packet: PacketType) {
      this.packet = packet;
      this.packetId = packet.getPacketId();
   }
   public cached: Uint8Array | null = null;
}
/*
export class RawImmediateMessage implements ImmediateMessage {
   public static from(packet: PacketType, cursor: Cursor): RawImmediateMessage {
      const pointer = cursor.pointer;
      packet.serialize(cursor);
      const size = cursor.pointer - pointer;
      cursor.pointer = pointer;
      const value = new this(cursor.getSliceSpan(size), packet.getPacketId());
      cursor.pointer = pointer + size;
      return value;
   }
   public constructor(raw: Uint8Array, packetId: number) {
      this.raw = raw;
      this.packetId = packetId;
   }
   public readonly raw: Uint8Array;
   public readonly packetId: number;
   public serialize(cursor: Cursor): void {
      cursor.writeSliceSpan(this.raw);
   }
   public getPacketId(): number {
      return this.packetId;
   }
   public getSize(): number {
      return this.raw.length;
   }
}
*/
