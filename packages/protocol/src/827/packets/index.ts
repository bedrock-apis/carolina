import { PacketIds } from '../enums';
import { DisconnectPacket } from './disconnect';
import { LoginPacket } from './login';
import { NetworkSettingsPacket } from './network-settings';
import { RequestNetworkSettingsPacket } from './request-network-settings';

export * from './request-network-settings';
export * from './network-settings';
export * from './disconnect';
export * from './login';

export const PACKET_ID_TO_TYPE_MAP = {
   [PacketIds.RequestNetworkSettings]: RequestNetworkSettingsPacket,
   [PacketIds.NetworkSettings]: NetworkSettingsPacket,
   [PacketIds.Login]: LoginPacket,
   [PacketIds.Disconnect]: DisconnectPacket,
} as const;
