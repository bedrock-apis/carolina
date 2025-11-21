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
import { DisconnectReason } from '../enums/disconnect-reason';
import { PacketCompilable, PacketType } from '../packet';

//Creates simple interface compounded type
const DisconnectMessage = createStructSerializable({ message: Str(VarInt), filteredMessage: Str(VarInt) });

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
         that.message = { filteredMessage: message, message };
      } else that.hideDisconnectScreen = true;
      return that;
   }
}
export { DisconnectPacket };
