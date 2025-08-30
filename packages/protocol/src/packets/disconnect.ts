import {
   SerializeAs,
   Str,
   VarInt,
   ZigZag,
   Conditional,
   createStructSerializable,
   SerializationTypeFor,
} from '@carolina/binary';
import { PacketIds } from '../enums';
import { PacketCompilable, PacketType } from '../packet';
import { DisconnectReason } from '../enums/disconnect-reason';

const DisconnectMessage = createStructSerializable({
   message: Str(VarInt),
   filteredMessage: Str(VarInt),
});
console.log(DisconnectMessage.deserialize.toString());

@PacketCompilable(PacketIds.Disconnect)
class DisconnectPacket extends PacketType {
   /**
    * The enumerated reason for the disconnection.
    */
   @SerializeAs(ZigZag) public reason!: number;

   /**
    * Whether the disconnect screen should be hidden.
    */
   @SerializeAs(Boolean) public hideDisconnectScreen: boolean = false;

   /**
    * The string message of the disconnect packet.
    * If `hideDisconnectScreen` is true, this will not be sent.
    * If `hideDisconnectScreen` is false, this will be sent as the disconnect message.
    */
   @SerializeAs(DisconnectMessage)
   @Conditional('hideDisconnectScreen', false, '===')
   public message?: SerializationTypeFor<typeof DisconnectMessage>;

   public static from(reason: DisconnectReason | number, message?: string): DisconnectPacket {
      const that = new this();
      that.reason = reason;
      if (message) {
         that.hideDisconnectScreen = false;
         that.message = {
            filteredMessage: message,
            message,
         };
      } else that.hideDisconnectScreen = true;
      return that;
   }
}
console.log(DisconnectPacket.deserialize.toString());

export { DisconnectPacket };
