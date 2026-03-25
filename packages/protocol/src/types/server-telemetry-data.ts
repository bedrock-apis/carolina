import { AbstractType, Compilable, Optional, SerializeAs, VarString } from '@carolina/binary';

import { UUID } from './common';

/**
 * Information about the gathering join.
 */
@Compilable
export class GatheringJoinInfo extends AbstractType {
   @SerializeAs(UUID)
   public experienceId!: string;

   @SerializeAs(VarString)
   public experienceName!: string;

   @SerializeAs(UUID)
   public experienceWorldId!: string;

   @SerializeAs(VarString)
   public experienceWorldName!: string;

   @SerializeAs(VarString)
   public creatorId!: string;

   @SerializeAs(UUID)
   public unk?: string;

   @SerializeAs(UUID)
   public unk1?: string;

   @SerializeAs(VarString)
   public serverId!: string;
}

/**
 * Information about the store entry point.
 */
@Compilable
export class StoreEntryPointInfo extends AbstractType {
   @SerializeAs(VarString)
   public storeId!: string;

   @SerializeAs(VarString)
   public storeName!: string;
}
/**
 * Information about the presence.
 */
@Compilable
export class PresenceInfo extends AbstractType {
   @SerializeAs(VarString)
   public experienceName!: string;

   @SerializeAs(VarString)
   public worldName!: string;
}
/**
 * Server join information.
 */
@Compilable
export class ServerJoinInfo extends AbstractType {
   @Optional
   @SerializeAs(GatheringJoinInfo)
   public gatheringJoinInfo?: GatheringJoinInfo;

   @Optional
   @SerializeAs(StoreEntryPointInfo)
   public storeEntryPointInfo?: StoreEntryPointInfo;

   @Optional
   @SerializeAs(PresenceInfo)
   public presenceInfo?: PresenceInfo;
}

/**
 * Telemetry data sent by the server.
 */
@Compilable
export class ServerTelemetryData extends AbstractType {
   @Optional
   @SerializeAs(ServerJoinInfo)
   public joinInfo?: ServerJoinInfo;

   @SerializeAs(VarString)
   public serverId!: string;

   @SerializeAs(VarString)
   public scenarioId!: string;

   @SerializeAs(VarString)
   public worldId!: string;

   @SerializeAs(VarString)
   public ownerId!: string;
}
