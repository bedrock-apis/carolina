import { Int16, LengthEncodeAs, SerializeAs, VarString } from '@carolina/binary';

import { PacketCompilable, PacketType } from '../abstract';
import { PacketIds } from '../enums';
import { ResourcePackDescriptor, ResourcePackDescriptorType, UUID } from '../types';

@PacketCompilable(PacketIds.ResourcePacksInfo)
export class ResourcePacksInfoPacket extends PacketType {
   /**
    * Whether the client should be forced to download the packs.
    */
   @SerializeAs(Boolean) public mustAccept!: boolean;

   /**
    * If the stack includes a resource pack that is apart of an addon pack.
    */
   @SerializeAs(Boolean) public hasAddons!: boolean;

   /**
    * If the stack includes a resource pack that scripting capabilities.
    */
   @SerializeAs(Boolean) public hasScripts!: boolean;

   /**
    * Wheather the client should disable vibrant visuals when connecting to the server.
    */
   @SerializeAs(Boolean) public forceDisableVibrantVisuals!: boolean;

   /**
    * Indicates what template the world is based on, if applicable.
    */
   @SerializeAs(UUID) public worldTemplateUuid!: string;

   /**
    * Indicates the version of the world template, if applicable.
    */
   @SerializeAs(VarString) public worldTemplateVersion!: string;

   /**
    * The list of resource packs to be sent to the client.
    */
   @SerializeAs(ResourcePackDescriptorType)
   @LengthEncodeAs(Int16, true)
   public packs!: Array<ResourcePackDescriptor>;
}
