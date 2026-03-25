import {
   Int32,
   SerializeAs,
   Cursor,
   String,
   VarInt32,
   Buffer,
   Compilable,
   AbstractType,
} from '@carolina/binary';

import { PacketCompilable, PacketType } from '../abstract';
import { PacketIds } from '../enums';

const String32LE = String(Int32, true);

@PacketCompilable(PacketIds.Login)
export class LoginPacket extends PacketType {
   @SerializeAs(Int32, false)
   public protocolVersion = 0;
   @SerializeAs(Buffer(VarInt32))
   public payload!: Uint8Array;
}

@Compilable
export class LoginTokensPayload extends AbstractType {
   @SerializeAs(String32LE)
   public authentication = '';
   @SerializeAs(String32LE)
   public data = '';
   public static fromBytes(data: Uint8Array): LoginTokensPayload {
      const cursor = Cursor.create(data);
      return this.deserialize(cursor);
   }
   public getBytes(): Uint8Array {
      const cursor = Cursor.create(new Uint8Array(this.data.length + this.authentication.length + 8));
      LoginTokensPayload.serialize(cursor, this);
      return cursor.getProcessedBytes();
   }
}
