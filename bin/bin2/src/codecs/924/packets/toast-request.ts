import { SerializeAs, VarString } from '@carolina/binary';

import { PacketIds } from '../../../enums';
import { PacketCompilable, PacketType } from '../../../packet';

@PacketCompilable(PacketIds.ToastRequest)
export class ToastRequestPacket extends PacketType {
   @SerializeAs(VarString)
   public title: string = '';
   @SerializeAs(VarString)
   public content: string = '';
}
