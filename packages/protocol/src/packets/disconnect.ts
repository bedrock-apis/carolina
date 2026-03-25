import {
   AbstractType,
   CompilableInterface,
   Conditional,
   InterfaceOf,
   SerializeAs,
   VarString,
   ZigZag32,
} from '@carolina/binary';

import { PacketCompilable, PacketType } from '../abstract';
import { PacketIds } from '../enums';
import { DisconnectReason } from '../enums/disconnect-reason';

//Creates simple interface compounded type
@CompilableInterface
class DisconnectMessageType extends AbstractType {
   @SerializeAs(VarString)
   public message!: string;
   @SerializeAs(VarString)
   public filteredMessage!: string;
}

@PacketCompilable(PacketIds.Disconnect)
class DisconnectPacket extends PacketType {
   /**
    * The enumerated reason for the disconnection.
    */
   @SerializeAs(ZigZag32) public reason!: number;

   /**
    * Whether the disconnect screen should be hidden.
    */
   @SerializeAs(Boolean) public hideDisconnectScreen = true;

   /**
    * The string message of the disconnect packet.
    * If `hideDisconnectScreen` is true, this will not be sent.
    * If `hideDisconnectScreen` is false, this will be sent as the disconnect message.
    */
   @SerializeAs(DisconnectMessageType)
   @Conditional('hideDisconnectScreen', `!$`)
   public message?: InterfaceOf<DisconnectMessageType>;

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
