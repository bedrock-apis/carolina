import { AbstractType, CompilableInterface, InterfaceOf, SerializeAs, VarString } from '@carolina/binary';

/**
 * Detailed information about a resource pack's identity and version.
 */
@CompilableInterface
export class ResourceIdVersionsType extends AbstractType {
   @SerializeAs(VarString)
   public uuid!: string;

   @SerializeAs(VarString)
   public version!: string;

   @SerializeAs(VarString)
   public name!: string;
}

export type ResourceIdVersions = InterfaceOf<ResourceIdVersionsType>;
