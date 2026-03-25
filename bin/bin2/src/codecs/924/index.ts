import { PacketIds } from '../../enums';
import { Codec } from '../codec';
import { AnimatePacket } from './packets/animate';
import { DisconnectPacket } from './packets/disconnect';
import { EmoteListPacket } from './packets/emote-list';
import { LoginPacket } from './packets/login';
import { MovePlayerPacket } from './packets/move-player';
import { NetworkSettingsPacket } from './packets/network-settings';
import { PlayStatusPacket } from './packets/play-status';
import { PlayerAuthInputPacket } from './packets/player-auth-input';
import { RequestNetworkSettingsPacket } from './packets/request-network-settings';
import { ResourcePackClientResponsePacket } from './packets/resource-pack-client-response';
import { ResourcePackDataInfoPacket } from './packets/resource-pack-data-info';
import { ResourcePacksInfoPacket } from './packets/resource-pack-info';
import { ResourcePackStackPacket } from './packets/resource-pack-stack';
import { ServerboundLoadingScreenPacket } from './packets/serverbound-loading-screen';
import { SetLocalPlayerAsInitializedPacket } from './packets/set-local-player-as-initialized';
import { StartGamePacket } from './packets/start-game';
import { ToastRequestPacket } from './packets/toast-request';
import * as TYPES from './types';
export const PROTOCOL_VERSION = 924;
export const codec = Codec.create(
   PROTOCOL_VERSION,
   {
      [PacketIds.Login]: LoginPacket,
      [PacketIds.Disconnect]: DisconnectPacket,
      [PacketIds.RequestNetworkSettings]: RequestNetworkSettingsPacket,
      [PacketIds.NetworkSettings]: NetworkSettingsPacket,
      [PacketIds.PlayStatus]: PlayStatusPacket,
      [PacketIds.ResourcePacksInfo]: ResourcePacksInfoPacket,
      [PacketIds.ResourcePackStack]: ResourcePackStackPacket,
      [PacketIds.ResourcePackClientResponse]: ResourcePackClientResponsePacket,
      [PacketIds.ResourcePackDataInfo]: ResourcePackDataInfoPacket,
      [PacketIds.MovePlayer]: MovePlayerPacket,
      [PacketIds.StartGame]: StartGamePacket,
      [PacketIds.SetLocalPlayerAsInitialized]: SetLocalPlayerAsInitializedPacket,
      [PacketIds.ServerboundLoadingScreen]: ServerboundLoadingScreenPacket,
      [PacketIds.PlayerAuthInput]: PlayerAuthInputPacket,
      [PacketIds.ToastRequest]: ToastRequestPacket,
      [PacketIds.Animate]: AnimatePacket,
      [PacketIds.EmoteList]: EmoteListPacket,
   },
   TYPES
);
