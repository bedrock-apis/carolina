import { AbstractType, CompilableInterface, InterfaceOf, SerializeAs, VarString } from '@carolina/binary';

@CompilableInterface
export class WorldExperimentType extends AbstractType {
   @SerializeAs(VarString)
   public name!: string;
   @SerializeAs(Boolean)
   public enabled!: boolean;
}
export type WorldExperiment = InterfaceOf<WorldExperimentType>;
