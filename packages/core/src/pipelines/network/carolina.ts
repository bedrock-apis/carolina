import { Cursor, NBT_FORMAT_WRITER, writeRootSync } from '@carolina/binary';
import { a, Logger, rgb, Vector3 } from '@carolina/common';
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

export class CarolinaNetworkPipeline extends NetworkPipeline<Client> {
   public readonly carolina: Carolina;
   public constructor(carolina: Carolina) {
      super(new Logger(rgb(124, 180, 70)(new.target.name), carolina.logger));
      this.carolina = carolina;
   }
   public override [PacketIds.Login](source: Client, packet: LoginPacket): void {
      super[PacketIds.Login]?.(source, packet);
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
      const tick = (): void => {
         const playerChunkX = lastPos.x >> 4,
            playerChunkZ = lastPos.z >> 4;
         const networkChunkPublisherUpdate = new NetworkChunkPublisherUpdatePacket();
         networkChunkPublisherUpdate.coordinate = lastPos;
         networkChunkPublisherUpdate.radius = chunkRadius << 4;
         networkChunkPublisherUpdate.savedChunks = [];
         // 1. Collect and sort coordinates by distance from center
         for (let x = playerChunkX - chunkRadius; x < playerChunkX + chunkRadius; x++) {
            for (let z = playerChunkZ - chunkRadius; z < playerChunkZ + chunkRadius; z++) {
               if (Math.hypot((x << 4) - lastPos.x, (z << 4) - lastPos.z) >= chunkRadius << 4) continue;
               const hash = Chunk.getUniqueHash(x, z);
               if (sentChunks.has(hash)) {
                  continue;
               }
               if (chunksInArray.has(hash)) continue;
               chunksInArray.add(hash);
               chunks_to_generate.push({ x, z });
            }
         }

         chunks_to_generate.sort((a1, b) => {
            const distA = (a1.x - playerChunkX) ** 2 + (a1.z - playerChunkZ) ** 2;
            const distB = (b.x - playerChunkX) ** 2 + (b.z - playerChunkZ) ** 2;
            return distB - distA;
         });

         //console.log(chunks_to_generate.length);
         while (chunks_to_generate.length) {
            // oxlint-disable-next-line typescript/no-non-null-assertion
            const chunk = chunks_to_generate.pop()!;
            const hash = Chunk.getUniqueHash(chunk.x, chunk.z);
            chunksInArray.delete(hash);
            if (Math.hypot((chunk.x << 4) - lastPos.x, (chunk.z << 4) - lastPos.z) >= chunkRadius << 4)
               continue;

            const cursor = Cursor.create(new Uint8Array(4096 * 16));
            const levelChunk = new LevelChunkPacket();
            levelChunk.x = chunk.x;
            levelChunk.z = chunk.z;
            levelChunk.dimension = DimensionKind.Overworld;

            const chunkObj = new Chunk(chunk.x, chunk.z, -4);
            //chunkObj.subChunks.push(new SubChunk()); // Assuming y=0 for subchunk index
            chunkObj.generate();

            Chunk.serialize(cursor, chunkObj);
            levelChunk.data = cursor.getProcessedBytes();
            levelChunk.subChunkCount = chunkObj.subChunks.length;
            //networkChunkPublisherUpdate.savedChunks.push({ x: chunk.x, z: chunk.z });
            source.send(levelChunk);
            networkChunkPublisherUpdate.savedChunks.push(chunk);

            sentChunks.add(hash);
            break;
         }
         source.send(networkChunkPublisherUpdate);
         setTimeout(tick, 5);
      };
      setImmediate(tick);
      this.logger.info(a`Player initialized ${source}`);
   }
   public override [PacketIds.RequestChunkRadius](source: Client, packet: RequestChunkRadiusPacket): void {
      chunkRadius = packet.radius;
      this.logger.info(a`Request chunk radius ${packet.radius}`);
   }
   public override [PacketIds.PlayerAuthInput](source: Client, packet: PlayerAuthInputPacket): void {
      lastPos = packet.location;
   }
   public override [PacketIds.ServerboundLoadingScreen](
      source: Client,
      packet: ServerboundLoadingScreenPacket
   ): void {
      //this.logger.info(packet.hasScreenId, ServerboundLoadingScreenType[packet.type]);
   }
}
let chunkRadius = 0;
let lastPos: Vector3 = { x: 0, y: 0, z: 0 };
const sentChunks = new Set<number>();
const chunksInArray = new Set<number>();
const chunks_to_generate: { x: number; z: number }[] = [];

/*
      (async (): Promise<void> => {
         const radius = 16;
         const chunks: { x: number; z: number }[] = [];

         // 1. Collect and sort coordinates by distance from center
         for (let x = -radius; x < radius; x++) {
            for (let z = -radius; z < radius; z++) {
               chunks.push({ x, z });
            }
         }

         chunks.sort((a, b) => a.x ** 2 + a.z ** 2 - (b.x ** 2 + b.z ** 2));

         // 2. Process sorted chunks
         for (const { x, z } of chunks) {
            await new Promise(res => setTimeout(res, 1));
         }
      })();
*/
