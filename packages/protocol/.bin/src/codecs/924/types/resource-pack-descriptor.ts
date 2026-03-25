import {
   AbstractType,
   CompilableInterface,
   InterfaceOf,
   SerializeAs,
   Uint64,
   VarString,
} from '@carolina/binary';

import { UUID } from './common';

/**
 * Detailed information about a resource pack.
 */
@CompilableInterface
export class ResourcePackDescriptorType extends AbstractType {
   /**
    * The uuid of the resource pack.
    */
   @SerializeAs(UUID)
   public uuid!: string;

   /**
    * The version of the resource pack.
    */
   @SerializeAs(VarString)
   public version!: string;

   /**
    * The size of the resource pack.
    */
   @SerializeAs(Uint64, true)
   public size!: bigint;

   /**
    * The content key of the resource pack.
    */
   @SerializeAs(VarString)
   public contentKey!: string;

   /**
    * The name of the subpack if applicable.
    */
   @SerializeAs(VarString)
   public subpackName!: string;

   /**
    * The content identity of the resource pack.
    */
   @SerializeAs(VarString)
   public contentIdentity!: string;

   /**
    * Whether the resource pack has scripts.
    */
   @SerializeAs(Boolean)
   public hasScripts!: boolean;

   /**
    * Whether the resource pack is apart of an addon pack.
    */
   @SerializeAs(Boolean)
   public isAddonPack!: boolean;

   /**
    * Whether the resource pack has RTX capabilities enabled.
    */
   @SerializeAs(Boolean)
   public hasRtxCapabilities!: boolean;

   /**
    * The CDN link for the resource pack, if applicable.
    */
   @SerializeAs(VarString)
   public cdnUrl!: string;
}

export type ResourcePackDescriptor = InterfaceOf<ResourcePackDescriptorType>;
