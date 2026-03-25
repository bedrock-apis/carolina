import { Logger } from '@carolina/common';
import { Carolina } from '@carolina/core';

Logger.level = Logger.OutputLoggerLevel.Debug;
const carolina = new Carolina();
await carolina.start();

/*
carolina.server.events.on('connected', c => {
   carolina.logger.debug(c.client.clientId);
});
carolina.networkHandler.on(PacketIds.ResourcePackClientResponse, c => {
   switch (c.packet.response) {
      case ResourcePackResponse.None:
      case ResourcePackResponse.Refused:
      case ResourcePackResponse.SendPacks:
      case ResourcePackResponse.HaveAllPacks: {
         const packet = new CODEC[PacketIds.ResourcePackStack]();
         packet.experiments = [];
         packet.experimentsPreviouslyToggled = false; 
         packet.gameVersion = '*';
         packet.hasEditorPacks = false;
         packet.mustAccept = false;
         packet.texturePacks = [];
         c.client.send(packet);
         break;
      }
      case ResourcePackResponse.Completed: {
         const startGame = new CODEC[PacketIds.StartGame]();
         startGame.entityId = 1n;
         startGame.runtimeEntityId = 1n;
         startGame.playerGameMode = GameMode.Creative;
         startGame.playerLocation = { x: 0, y: 128, z: 0 };
         startGame.pitch = 0;
         startGame.yaw = 0;
         startGame.seed = 12345n;
         startGame.biomeType = 0;
         startGame.biomeName = 'plains';
         startGame.dimension = 0; // Overworld
         startGame.generator = 1; // Infinite
         startGame.worldGameMode = GameMode.Creative;
         startGame.hardcore = false;
         startGame.difficulty = Difficulty.Normal;
         startGame.spawnLocation = { x: 0, y: 64, z: 0 };
         startGame.achievementsDisabled = true;
         startGame.editorWorldType = 0; // NotEditor
         startGame.createdInEditor = false;
         startGame.exportedFromEditor = false;
         startGame.dayCycleStopTime = 0;
         startGame.eduOffer = 0;
         startGame.eduFeatures = false;
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

         const showCoordinates = new TYPES.GameRuleType();
         showCoordinates.name = 'showcoordinates';
         showCoordinates.editable = true;
         showCoordinates.type = GameRuleKind.Bool;
         showCoordinates.value = true;

         startGame.gameRules = [showCoordinates];
         startGame.experiments = [];
         startGame.experimentsPreviouslyToggled = false;
         startGame.bonusChest = false;
         startGame.mapEnabled = false;
         startGame.permissionLevel = PermissionLevel.Operator;
         startGame.serverChunkTickRange = 4;
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
         startGame.isNewNether = false;
         startGame.eduResourceUriButtonName = '';
         startGame.eduResourceUriLink = '';
         startGame.experimentalGameplayOverride = false;
         startGame.chatRestrictionLevel = 0; // None
         startGame.disablePlayerInteractions = false;
         startGame.levelIdentfier = 'Jerver';
         startGame.levelName = 'Jerver World';
         startGame.premiumWorldTemplateId = '';
         startGame.isTrial = false;
         startGame.rewindHistorySize = 0;
         startGame.serverAuthoritativeBlockBreaking = true;
         startGame.currentTick = 0n;
         startGame.enchantmentSeed = 12345;
         startGame.blockTypeDefinitions = [];
         startGame.multiplayerCorrelationId = '<raknet>a555-7ece-2f1c-8f69';
         startGame.serverAuthoritativeInventory = true;
         startGame.engine = 'Jerver';
         startGame.blockPaletteChecksum = 0n;
         startGame.worldTemplateId = new TYPES.UUID('00000000-0000-0000-0000-000000000000');
         startGame.clientSideGeneration = false;
         startGame.blockNetworkIdsAreHashes = true;
         startGame.serverControlledSounds = true;
         startGame.containsServerJoinInfo = true;

         const telemetry = new TYPES.ServerTelemetryData();
         telemetry.serverId = '';
         telemetry.scenarioId = '';
         telemetry.worldId = '';
         telemetry.ownerId = '';
         startGame.serverTelemetryData = telemetry;

         c.client.send(startGame);
      }
   }
});
carolina.networkHandler.on(PacketIds.Login, c => {
   carolina.logger.debug(a`Protocol version ${c.packet.protocolVersion}`);
   const playStatus = new CODEC[PacketIds.PlayStatus]();
   playStatus.status = PlayStatus.LoginSuccess;
   c.client.send(playStatus);

   const info = new CODEC[PacketIds.ResourcePacksInfo]();
   info.forceDisableVibrantVisuals = false;
   info.hasAddons = false;
   info.hasScripts = false;
   info.mustAccept = false;
   info.worldTemplateUuid = new TYPES.UUID('00000000-0000-0000-0000-000000000000');
   info.worldTemplateVersion = '';
   info.packs = [];
   c.client.send(info);
});*/
