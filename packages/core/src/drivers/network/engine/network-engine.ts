import { Cursor, VarInt32 } from '@carolina/binary';
import { a, PersonalEmitter } from '@carolina/common';
import { NetworkConnection, NetworkServer } from '@carolina/net';
import { RequestNetworkSettingsPacket, PacketCompressionAlgorithm } from '@carolina/protocol';
import { deflateRawSync, inflateRawSync } from 'node:zlib';

import { NETWORK_DRIVER_LOGGER } from '../../../loggers';
import { DriverConnection } from './connection';

export enum NetworkEngineEventKeys {
   Connect = 0,
   Message = 1,
   Disconnect = 2,
}
export interface NetworkEngineEvents {
   [NetworkEngineEventKeys.Connect]: { connection: DriverConnection };
   [NetworkEngineEventKeys.Message]: { connection: DriverConnection; message: Uint8Array };
   [NetworkEngineEventKeys.Disconnect]: { connection: DriverConnection };
}
const MESSAGE_EVENT_CACHE_TYPE = NetworkEngineEventKeys.Message;
export abstract class NetworkEngine<S extends NetworkServer = NetworkServer> {
   public readonly events: PersonalEmitter<NetworkEngineEvents> = new PersonalEmitter();
   public readonly connections: Map<NetworkConnection, DriverConnection> = new Map();
   public readonly clients: Map<number, DriverConnection> = new Map();
   public readonly server: S;
   public constructor(listener: S) {
      this.server = listener;
      this.server.onConnectionConnected = (c): void => {
         const connection = new DriverConnection(c);
         this.clients.set(connection.runtimeId, connection);
         this.connections.set(c, connection);
         // We don't dispatch connect event bc the connection is not yet established
         // this.events.dispatch('connect', { connection });
      };
      this.server.onConnectionMessaged = (c, m): void => {
         const connection = this.connections.get(c);
         if (connection) this.handlePayload(connection, m);
      };
      this.server.onConnectionDisconnected = (c): void => {
         const connection = this.connections.get(c);
         if (!connection) return;
         this.clients.delete(connection.runtimeId);
         this.connections.delete(c);
         this.events.dispatch(NetworkEngineEventKeys.Disconnect, { connection });
      };
      this.server.onError = (error): void => {
         console.log(error);
         NETWORK_DRIVER_LOGGER.error(error);
      };
      this.server.onLog = (message): void => NETWORK_DRIVER_LOGGER.log(message);
   }
   protected handlePayload(connection: DriverConnection, message: Uint8Array): void {
      // Handle case the payload is prefixed by raknet game packet id
      if (message[0] === 0xfe) message = message.subarray(1);

      // This is always false once the connection is established
      if (connection.skipNetworkSettingsResolution) {
         const cursor = Cursor.create(message);

         do {
            const length = VarInt32.deserialize(cursor);

            //No copy
            const buffer = cursor.getSliceSpan(length);
            cursor.pointer += length;
            this.handlePacket(connection, buffer);
         } while (!cursor.isEndOfStream);

         // We do not dispatch packets that are from pre-connection state.
         return;
      }

      //TODO - Implement encryption, encryption is done on top of the compression
      const compressionMethod = message[0];
      if (compressionMethod === PacketCompressionAlgorithm.Zlib)
         message = inflateRawSync(message.subarray(1) as Uint8Array<ArrayBuffer>);
      else if (compressionMethod === PacketCompressionAlgorithm.NoCompression) message = message.subarray(1);
      else
         return void NETWORK_DRIVER_LOGGER.error(
            a`Unknown compression method: ${PacketCompressionAlgorithm[compressionMethod]}.`
         );

      // Should be efficient
      try {
         this.events.dispatch(MESSAGE_EVENT_CACHE_TYPE, { connection, message });
      } catch (error) {
         console.error(error);
         void NETWORK_DRIVER_LOGGER.error(error);
      }
   }
   protected getWriteCursor(size: number): Cursor {
      return Cursor.create(new Uint8Array(size));
   }
   public send(connection: DriverConnection, message: Uint8Array): void {
      const cursor = this.getWriteCursor(message.length + 15);

      // Depends on network settings were send it self
      if (!connection.skipNetworkSettingsResolution) {
         // Select compression does depends on payload size
         const compression =
            message.length >= connection.networkSettings.compressionThreshold
               ? connection.networkSettings.compressionAlgorithm
               : PacketCompressionAlgorithm.NoCompression;

         // Write Compression Method
         cursor.writeUint8(compression);

         // Prepare final payload
         message =
            compression === PacketCompressionAlgorithm.Zlib ? deflateRawSync(message, { level: 1 }) : message;
      }
      cursor.writeSliceSpan(message);
      this.server.send(connection.connection, cursor.getProcessedBytes());
   }
   protected handlePacket(connection: DriverConnection, message: Uint8Array): void {
      const cursor = Cursor.create(message);
      const packetId = VarInt32.deserialize(cursor);
      if (packetId === RequestNetworkSettingsPacket.packetId) {
         // a bit hacky, but it does its job and its run only once when player tries to join.
         const cursor1 = Cursor.create(new Uint8Array(64));
         const cursor2 = Cursor.create(new Uint8Array(64));
         VarInt32.serialize(cursor2, connection.networkSettings.getPacketId());
         connection.networkSettings.getType().serialize(cursor2, connection.networkSettings);
         // Length
         VarInt32.serialize(cursor1, cursor2.pointer);
         cursor1.writeSliceSpan(cursor2.getProcessedBytes());

         this.send(connection, cursor1.getProcessedBytes());
         connection.skipNetworkSettingsResolution = false;

         // Now the connection is established so trigger the connect event
         this.events.dispatch(NetworkEngineEventKeys.Connect, { connection: connection });
      }
   }
   public disconnect(connection: DriverConnection): void {
      this.server.disconnect(connection.connection);
   }
   public dispose(): void {
      this.server.dispose();
   }
}
