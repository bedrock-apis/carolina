import { Int, SerializeAs, Cursor, Str, VarInt, Buffer, Compilable, AbstractType } from '@carolina/binary';
import { PacketCompilable, PacketType } from '../packet';
import { PacketIds } from '../enums';

@PacketCompilable(PacketIds.Login)
export class LoginPacket extends PacketType {
   @SerializeAs(Int, false)
   public protocolVersion: number = 0;
   @SerializeAs(Buffer(VarInt))
   public payload!: Uint8Array;
}

const String32LE = Str(Int, true);
@Compilable
export class LoginTokensPayload extends AbstractType {
   @SerializeAs(String32LE)
   public authentication: string = '';
   @SerializeAs(String32LE)
   public data: string = '';
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
/*
{
   ManualImplement(LoginPacket, PacketIds.Login, {
      deserialize(cursor): LoginPacket {
         const $ = new LoginPacket();
         $.protocolVersion = Int.deserialize(cursor, false);
         return Encapsulation.decapsulate(cursor, VarInt, cursor => {
            $.identity = String32LE.deserialize(cursor);
            $.client = String32LE.deserialize(cursor);
            return $;
         });
      },
      serialize(cursor, value) {
         Int.serialize(cursor, value.protocolVersion);
         Encapsulation.encapsulate(
            cursor,
            VarInt,
            cursor => {
               String32LE.serialize(cursor, value.identity);
               String32LE.serialize(cursor, value.client);
            },
            null,
         );
      },
   });
}
*/
