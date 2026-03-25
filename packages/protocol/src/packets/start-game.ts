import {
   Float32,
   Int16,
   Int32,
   LengthEncodeAs,
   SerializeAs,
   Uint64,
   Uint8,
   VarUint32,
   VarString,
   ZigZag32,
} from '@carolina/binary';
import { Vector3 } from '@carolina/common';

import { PacketCompilable, PacketType } from '../abstract';
import { PacketIds, GameMode, Difficulty, PermissionLevel } from '../enums';
import { DimensionKind } from '../enums';
import { BlockLocation, EntityIdType, EntityRuntimeIdType, GameModeType, UUID, Vector3f } from '../types';
import { GameRule, GameRuleType } from '../types/game-rule';
import { ServerTelemetryData } from '../types/server-telemetry-data';
import { WorldExperiment, WorldExperimentType } from '../types/world-experiments';

@PacketCompilable(PacketIds.StartGame)
export class StartGamePacket extends PacketType {
   @SerializeAs(EntityIdType) public entityId!: bigint; // World Entity Id
   @SerializeAs(EntityRuntimeIdType) public runtimeEntityId!: bigint; // Whatever i send
   @SerializeAs(GameModeType) public playerGameMode!: GameMode;
   @SerializeAs(Vector3f) public playerLocation!: Vector3;
   @SerializeAs(Float32, true) public pitch!: number;
   @SerializeAs(Float32, true) public yaw!: number;
   @SerializeAs(Uint64, true) public seed!: bigint;
   @SerializeAs(Int16, true) public biomeType!: number;
   @SerializeAs(VarString) public biomeName!: string;
   @SerializeAs(ZigZag32) public dimension!: DimensionKind;
   @SerializeAs(ZigZag32) public generator!: number;
   @SerializeAs(ZigZag32) public worldGameMode!: GameMode;
   @SerializeAs(Boolean) public hardcore!: boolean;
   @SerializeAs(ZigZag32) public difficulty!: Difficulty;
   @SerializeAs(BlockLocation) public spawnLocation!: Vector3;
   @SerializeAs(Boolean) public achievementsDisabled!: boolean;
   @SerializeAs(ZigZag32) public editorWorldType!: number;
   @SerializeAs(Boolean) public createdInEditor!: boolean;
   @SerializeAs(Boolean) public exportedFromEditor!: boolean;
   @SerializeAs(ZigZag32) public dayCycleStopTime!: number;
   @SerializeAs(ZigZag32) public eduOffer!: number;
   @SerializeAs(Boolean) public eduFeatures!: boolean;
   @SerializeAs(VarString) public eduProductUuid!: string;
   @SerializeAs(Float32, true) public rainLevel!: number;
   @SerializeAs(Float32, true)
   public lightningLevel!: number;
   @SerializeAs(Boolean) public confirmedPlatformLockedContent!: boolean;
   @SerializeAs(Boolean) public multiplayerGame!: boolean;
   @SerializeAs(Boolean) public broadcastToLan!: boolean;
   @SerializeAs(VarUint32) public xblBroadcastMode!: number;
   @SerializeAs(VarUint32) public platformBroadcastMode!: number;
   @SerializeAs(Boolean) public commandsEnabled!: boolean;
   @SerializeAs(Boolean) public texturePacksRequired!: boolean;
   @SerializeAs(GameRuleType)
   @LengthEncodeAs(VarUint32)
   public gameRules!: Array<GameRule>;
   @SerializeAs(WorldExperimentType)
   @LengthEncodeAs(Int32, true)
   public experiments!: Array<WorldExperiment>;
   @SerializeAs(Boolean) public experimentsPreviouslyToggled!: boolean;
   @SerializeAs(Boolean) public bonusChest!: boolean;
   @SerializeAs(Boolean) public mapEnabled!: boolean;
   @SerializeAs(ZigZag32) public permissionLevel!: PermissionLevel;
   @SerializeAs(Int32, true)
   public serverChunkTickRange!: number;
   @SerializeAs(Boolean) public hasLockedBehaviorPack!: boolean;
   @SerializeAs(Boolean) public hasLockedResourcePack!: boolean;
   @SerializeAs(Boolean) public isFromLockedWorldTemplate!: boolean;
   @SerializeAs(Boolean) public useMsaGamertagsOnly!: boolean;
   @SerializeAs(Boolean) public isFromWorldTemplate!: boolean;
   @SerializeAs(Boolean) public isWorldTemplateOptionLocked!: boolean;
   @SerializeAs(Boolean) public onlySpawnV1Villagers!: boolean;
   @SerializeAs(Boolean) public personaDisabled!: boolean;
   @SerializeAs(Boolean) public customSkinsDisabled!: boolean;
   @SerializeAs(Boolean) public emoteChatMuted!: boolean;
   @SerializeAs(VarString) public gameVersion!: string;
   @SerializeAs(Int32, true)
   public limitedWorldWidth!: number;
   @SerializeAs(Int32, true)
   public limitedWorldLength!: number;
   @SerializeAs(Boolean) public isNewNether!: boolean;
   @SerializeAs(VarString) public eduResourceUriButtonName!: string;
   @SerializeAs(VarString) public eduResourceUriLink!: string;
   @SerializeAs(Boolean) public experimentalGameplayOverride!: boolean;
   @SerializeAs(Uint8) public chatRestrictionLevel!: number;
   @SerializeAs(Boolean) public disablePlayerInteractions!: boolean;
   @SerializeAs(VarString) public levelIdentifier!: string;
   @SerializeAs(VarString) public levelName!: string;
   @SerializeAs(VarString) public premiumWorldTemplateId!: string;
   @SerializeAs(Boolean) public isTrial!: boolean;
   @SerializeAs(ZigZag32) public rewindHistorySize!: number;
   @SerializeAs(Boolean) public serverAuthoritativeBlockBreaking!: boolean;
   @SerializeAs(Uint64, true) public currentTick!: bigint;
   @SerializeAs(ZigZag32) public enchantmentSeed!: number;

   @SerializeAs(Boolean)
   @LengthEncodeAs(VarUint32)
   public blockTypeDefinitions!: Array<void>; // Bru i know i just, nvm, you know as well

   @SerializeAs(VarString) public multiplayerCorrelationId!: string;
   @SerializeAs(Boolean) public serverAuthoritativeInventory!: boolean;
   @SerializeAs(VarString) public engine!: string;

   //RawNBT
   @SerializeAs(Uint8)
   private _OPEN_NBT: number = 0x0a;
   @SerializeAs(Uint8)
   private _TAG_NAME: number = 0x00;
   @SerializeAs(Uint8)
   private _CLOSE_COMPOUND: number = 0x00;

   @SerializeAs(Uint64, true)
   public blockPaletteChecksum!: bigint;
   @SerializeAs(UUID) public worldTemplateId!: string;
   @SerializeAs(Boolean) public clientSideGeneration!: boolean;
   @SerializeAs(Boolean) public blockNetworkIdsAreHashes!: boolean;
   @SerializeAs(Boolean) public serverControlledSounds!: boolean;

   @SerializeAs(ServerTelemetryData)
   public serverTelemetryData!: ServerTelemetryData;
}
