import { AbstractType, Compilable, Optional, SerializeAs, VarString } from '@carolina/binary';

/**
 * Detailed experience data sent when join info is gathered.
 */
@Compilable
export class ExperienceData extends AbstractType {
   @SerializeAs(VarString)
   public id!: string;

   @SerializeAs(VarString)
   public name!: string;

   @SerializeAs(VarString)
   public worldId!: string;

   @SerializeAs(VarString)
   public creatorId!: string;

   @SerializeAs(VarString)
   public storeId!: string;
}

/**
 * Grouped join information for telemetry.
 */
@Compilable
export class JoinInfo extends AbstractType {
   @Optional
   @SerializeAs(ExperienceData)
   public experience?: ExperienceData;
}

/**
 * Telemetry data sent by the server.
 */
@Compilable
export class ServerTelemetryData extends AbstractType {
   @Optional
   @SerializeAs(JoinInfo)
   public joinInfo?: JoinInfo;

   @SerializeAs(VarString)
   public serverId!: string;

   @SerializeAs(VarString)
   public scenarioId!: string;

   @SerializeAs(VarString)
   public worldId!: string;

   @SerializeAs(VarString)
   public ownerId!: string;
}
