import { LengthEncodeAs, SerializeAs, Uint16, Uint8, VarString } from '@carolina/binary';

import { PacketIds, ResourcePackResponse } from '../../../enums';
import { PacketCompilable, PacketType } from '../../../packet';

export type RequestedResourcePack = `${string}_${string}`;

@PacketCompilable(PacketIds.ResourcePackClientResponse)
export class ResourcePackClientResponsePacket extends PacketType {
   /**
    * The response from the client.
    */
   @SerializeAs(Uint8)
   public response!: ResourcePackResponse;

   /**
    * The list of resource packs requested by the client.
    */
   @SerializeAs(VarString)
   @LengthEncodeAs(Uint16, true)
   public packs!: Array<RequestedResourcePack>;
}
