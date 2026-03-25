import { SerializeAs, VarString } from '@carolina/binary';

import { PacketCompilable, PacketType } from '../abstract';
import { PacketIds } from '../enums';

@PacketCompilable(PacketIds.ToastRequest)
export class ToastRequestPacket extends PacketType {
   @SerializeAs(VarString)
   public title: string = '';
   @SerializeAs(VarString)
   public content: string = '';
}
