import { Cursor, NBT_FORMAT_WRITER, writeRootSync } from '@carolina/binary';
import { a, Logger, rgb } from '@carolina/common';
import {
   AnimatePacket,
   BiomeDefinitionListPacket,
   Difficulty,
   DimensionKind,
   GameMode,
   LevelChunkPacket,
   LoginPacket,
   LoginTokensPayload,
   NetworkChunkPublisherUpdatePacket,
   PacketIds,
   PermissionLevel,
   PlayerAuthInputPacket,
   PlayStatus,
   PlayStatusPacket,
   RequestChunkRadiusPacket,
   ResourcePackClientResponsePacket,
   ResourcePackResponse,
   ResourcePacksInfoPacket,
   ResourcePackStackPacket,
   ServerboundLoadingScreenPacket,
   ServerTelemetryData,
   StartGamePacket,
} from '@carolina/protocol';

import { type Carolina, type Client } from '../../main';
import { NetworkPipeline } from '../../network/pipeline';
import { Chunk } from '../../world/chunks/chunk';
import { SubChunk } from '../../world/chunks/sub-chunk';

export class CarolinaNetworkPipeline extends NetworkPipeline<Client> {
   public readonly carolina: Carolina;
   public constructor(carolina: Carolina) {
      super(new Logger(rgb(124, 180, 70)(new.target.name), carolina.logger));
      this.carolina = carolina;
   }
   public override [PacketIds.Login](source: Client, packet: LoginPacket): void {
      super[PacketIds.Login]?.(source, packet);
      console.log(LoginTokensPayload.fromBytes(packet.payload).authentication);
      // Login Status
      const status = new PlayStatusPacket();
      status.status = PlayStatus.LoginSuccess;
      source.send(status);

      // StackInfo
      const info = new ResourcePacksInfoPacket();
      info.forceDisableVibrantVisuals = false;
      info.hasAddons = false;
      info.hasScripts = false;
      info.mustAccept = false;
      info.worldTemplateUuid = '00000000-0000-0000-0000-000000000000';
      info.worldTemplateVersion = '';
      info.packs = [
         {
            cdnUrl: '',
            contentIdentity: '',
            version: '1.0.0',
            contentKey: '',
            hasRtxCapabilities: false,
            hasScripts: false,
            isAddonPack: false,
            size: 0n,
            subpackName: '',
            uuid: '0fba4063-dba1-4281-9b89-ff9390653530',
         },
         {
            cdnUrl: '',
            contentIdentity: '',
            version: '1.0.0',
            contentKey: '',
            hasRtxCapabilities: false,
            hasScripts: false,
            isAddonPack: false,
            size: 0n,
            subpackName: '',
            uuid: '6baf8b62-8948-4c99-bb1e-a0cb35dc4579',
         },
      ];
      source.send(info);
   }
   public override [PacketIds.ResourcePackClientResponse](
      source: Client,
      packet: ResourcePackClientResponsePacket
   ): void {
      switch (packet.response) {
         case ResourcePackResponse.None:
         case ResourcePackResponse.Refused:
         case ResourcePackResponse.SendPacks:
         case ResourcePackResponse.HaveAllPacks: {
            const packet = new ResourcePackStackPacket();
            packet.experiments = [];
            packet.experimentsPreviouslyToggled = false;
            packet.gameVersion = '*';
            packet.hasEditorPacks = false;
            packet.mustAccept = true;
            packet.texturePacks = [];
            source.send(packet);
            break;
         }
         case ResourcePackResponse.Completed: {
            const startGame = new StartGamePacket();
            startGame.entityId = 1n;
            startGame.runtimeEntityId = 1n;
            startGame.playerGameMode = GameMode.Spectator;
            startGame.playerLocation = { x: 0, y: 0, z: 0 };
            startGame.pitch = 0;
            startGame.yaw = 0;
            startGame.seed = 0n;
            startGame.biomeType = 0;
            startGame.biomeName = 'plains';
            startGame.dimension = DimensionKind.Overworld;
            startGame.generator = 1; // Infinite
            startGame.worldGameMode = GameMode.Spectator;
            startGame.hardcore = true;
            startGame.difficulty = Difficulty.Normal;
            startGame.spawnLocation = { x: 0, y: 64, z: 0 };
            startGame.achievementsDisabled = true;
            startGame.editorWorldType = 0;
            startGame.createdInEditor = false;
            startGame.exportedFromEditor = false;
            startGame.dayCycleStopTime = 0;
            startGame.eduOffer = 0;
            startGame.eduFeatures = true;
            startGame.eduProductUuid = '';
            startGame.rainLevel = 0;
            startGame.lightningLevel = 0;
            startGame.confirmedPlatformLockedContent = false;
            startGame.multiplayerGame = true;
            startGame.broadcastToLan = true;
            startGame.xblBroadcastMode = 6;
            startGame.platformBroadcastMode = 6;
            startGame.commandsEnabled = true;
            startGame.texturePacksRequired = false;

            startGame.gameRules = [];
            startGame.experiments = this.carolina.behaviorPipeline.getActiveExperiments(source);
            startGame.experimentsPreviouslyToggled = startGame.experiments.some(_ => _.enabled);
            startGame.bonusChest = false;
            startGame.mapEnabled = false;
            startGame.permissionLevel = PermissionLevel.Visitor;
            startGame.serverChunkTickRange = 0;
            startGame.hasLockedBehaviorPack = false;
            startGame.hasLockedResourcePack = false;
            startGame.isFromLockedWorldTemplate = false;
            startGame.useMsaGamertagsOnly = false;
            startGame.isFromWorldTemplate = false;
            startGame.isWorldTemplateOptionLocked = false;
            startGame.onlySpawnV1Villagers = false;
            startGame.personaDisabled = false;
            startGame.customSkinsDisabled = false;
            startGame.emoteChatMuted = false;
            startGame.gameVersion = '*';
            startGame.limitedWorldWidth = 16;
            startGame.limitedWorldLength = 16;
            startGame.isNewNether = true;
            startGame.eduResourceUriButtonName = '';
            startGame.eduResourceUriLink = '';
            startGame.experimentalGameplayOverride = false;
            startGame.chatRestrictionLevel = 0; // None
            startGame.disablePlayerInteractions = false;
            startGame.levelIdentifier = 'Carolina';
            startGame.levelName = 'Carolina World';
            startGame.premiumWorldTemplateId = '';
            startGame.isTrial = false;
            startGame.rewindHistorySize = 0;
            startGame.serverAuthoritativeBlockBreaking = true;
            startGame.currentTick = 0n;
            startGame.enchantmentSeed = 0;
            startGame.blockTypeDefinitions = [];
            startGame.multiplayerCorrelationId = '<raknet>a555-7ece-2f1c-8f69';
            startGame.serverAuthoritativeInventory = true;
            startGame.engine = 'Carolina';
            startGame.blockPaletteChecksum = 0n;
            startGame.worldTemplateId = '00000000-0000-0000-0000-000000000000';
            startGame.clientSideGeneration = false;
            startGame.blockNetworkIdsAreHashes = false;
            startGame.serverControlledSounds = true;

            const telemetry = new ServerTelemetryData();
            telemetry.serverId = '';
            telemetry.scenarioId = '';
            telemetry.worldId = '';
            telemetry.ownerId = '';
            startGame.serverTelemetryData = telemetry;

            source.send(startGame);

            const defs = new BiomeDefinitionListPacket();
            defs.lengthX = 0;
            defs.lengthY = 0;
            source.send(defs);

            const play = new PlayStatusPacket();
            play.status = PlayStatus.PlayerSpawn;
            source.send(play);
            this.carolina.world.network.attach(source);
         }
      }
   }
   public override [PacketIds.Animate](source: Client, packet: AnimatePacket): void {}
   public override [PacketIds.SetLocalPlayerAsInitialized](source: Client): void {
      const OFFSET = 0x811c9dc5;
      const cursor = Cursor.create(new Uint8Array(256));
      writeRootSync(
         cursor,
         { name: 'minecraft:bedrock', states: { infiniburn_bit: false } },
         NBT_FORMAT_WRITER,
         ''
      );
      const bytes = cursor.getProcessedBytes();
      console.log(bytes);
      let hash = OFFSET;
      for (const byte of bytes) {
         hash ^= byte;
         hash = hash + (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
      }
      console.log(hash | 0);
      this.logger.info(a`Player initialized ${source}`);
   }
   public override [PacketIds.RequestChunkRadius](source: Client, packet: RequestChunkRadiusPacket): void {
      const levelChunk = new LevelChunkPacket();
      levelChunk.x = 0;
      levelChunk.z = 0;
      levelChunk.dimension = DimensionKind.Overworld;
      levelChunk.subChunkCount = 1;

      const cursor = Cursor.create(new Uint8Array(4096));
      const chunk2 = new Chunk(0, 0);
      chunk2.subChunks.push(new SubChunk());
      Chunk.serialize(cursor, chunk2);
      levelChunk.data = cursor.getProcessedBytes();

      const networkChunkPublisherUpdate = new NetworkChunkPublisherUpdatePacket();
      networkChunkPublisherUpdate.coordinate = { x: 0, y: 0, z: 0 };
      networkChunkPublisherUpdate.radius = packet.radius << 4;
      networkChunkPublisherUpdate.savedChunks = [];
      for (let x = -packet.radius; x < packet.radius; x++)
         for (let z = -packet.radius; z < packet.radius; z++) {
            levelChunk.x = x;
            levelChunk.z = z;
            source.send(levelChunk);
            networkChunkPublisherUpdate.savedChunks.push({ x, z });
         }
      source.send(networkChunkPublisherUpdate);
      this.logger.info(a`Request chunk radius ${packet.radius}`);
   }
   public override [PacketIds.PlayerAuthInput](source: Client, packet: PlayerAuthInputPacket): void {}
   public override [PacketIds.ServerboundLoadingScreen](
      source: Client,
      packet: ServerboundLoadingScreenPacket
   ): void {
      //this.logger.info(packet.hasScreenId, ServerboundLoadingScreenType[packet.type]);
   }
}
