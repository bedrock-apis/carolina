import { RakNetReliability, ServerConnection } from '@carolina/raknet';
import { CarolinaServer } from './server';
import { Cursor, ResizableCursor, SerializableType, VarInt } from '@carolina/binary';
import {
   PacketIds,
   NetworkSettingsPacket,
   PacketCompressionAlgorithm,
   RequestNetworkSettingsPacket,
   PacketType,
   DisconnectPacket,
   DisconnectReason,
   PROTOCOL_VERSION,
   LoginPacket,
   LoginTokensPayload,
} from '@carolina/protocol';
import { deflateRawSync, inflateRawSync } from 'node:zlib';
import { HANDLERS, registerHandler } from '../handlers/base';

export class CarolinaConnection {
   static {
      registerHandler(RequestNetworkSettingsPacket, (packet, connection) => {
         if (packet.clientNetworkVersion !== PROTOCOL_VERSION) {
            /*
            connection.send([
               DisconnectPacket.from(
                  packet.clientNetworkVersion > PROTOCOL_VERSION
                     ? DisconnectReason.OutdatedServer
                     : DisconnectReason.OutdatedClient,
               ),
            ]);
            connection.connection.flush();
            connection.connection.disconnect();*/
         }

         // First send then update client state
         connection.send([connection.networkSettings]);
         connection.isNetworkReady = true;
         console.log('Client protocol version: ', packet.clientNetworkVersion);
         console.log('Successfully handled');
      });
   }
   protected isNetworkReady = false;
   protected networkSettings = new NetworkSettingsPacket();
   public constructor(
      public readonly server: CarolinaServer,
      public readonly connection: ServerConnection,
   ) {
      connection.onGamePacket = this.handlePayload.bind(this);
      this.networkSettings.compressionAlgorithm = PacketCompressionAlgorithm.Zlib;
   }
   public handlePayload(message: Uint8Array): void {
      // Handle case the payload is prefixed by raknet game packet id
      if (message[0] === 0xfe) message = message.subarray(1);

      // This is always true once the connection is established
      if (this.isNetworkReady) {
         //TODO - Implement encryption, encryption is done on top of the compression
         const compressionMethod = message[0];
         console.log(compressionMethod);
         if (compressionMethod === PacketCompressionAlgorithm.Snappy)
            throw new Error('Snappy compression is not supported');
         else if (compressionMethod === PacketCompressionAlgorithm.Zlib) {
            message = inflateRawSync(message.subarray(1) as Uint8Array<ArrayBuffer>);
         } else message = message.subarray(1);
      }

      const cursor = Cursor.create(message);

      do {
         const length = VarInt.deserialize(cursor);
         const buffer = cursor.getSliceSpan(length);
         cursor.pointer += length;
         this.handlePacket(buffer);
      } while (!cursor.isEndOfStream);
   }
   protected handlePacket(data: Uint8Array): void {
      const cursor = Cursor.create(data);
      const packetId = VarInt.deserialize(cursor);
      if (!(packetId in HANDLERS))
         return console.warn('[Warning]', 'No packet handler for ' + (PacketIds[packetId] ?? packetId));

      console.log('Received: ' + PacketIds[packetId]);
      const { type, handler } = HANDLERS[packetId];
      handler(type.deserialize(cursor), this);
   }
   public send(packets: PacketType[]): void {
      const singlePacketCursor = this.server.singlePacketCursorHelper;
      const multiPacketCursor = this.server.multiPacketCursorHelper;
      multiPacketCursor.reset();
      for (const packet of packets) {
         singlePacketCursor.reset();
         VarInt.serialize(singlePacketCursor, packet.getPacketId());
         tryWriteUnknownSize(packet.getType(), packet, singlePacketCursor);
         const buffer = singlePacketCursor.getProcessedBytes();
         const minLength = 2 + buffer.length;

         multiPacketCursor.growToFit(minLength);
         VarInt.serialize(multiPacketCursor, buffer.length);
         multiPacketCursor.writeSliceSpan(buffer);
      }

      let message = multiPacketCursor.getProcessedBytes();
      // +16 there might be compression headers for small chunks
      const sendBuffer = Cursor.create(new Uint8Array(message.length + 2 + 16));
      // Raknet packet Id
      sendBuffer.writeUint8(0xfe);

      if (this.isNetworkReady) {
         const compression =
            message.length >= this.networkSettings.compressionThreshold
               ? this.networkSettings.compressionAlgorithm
               : PacketCompressionAlgorithm.NoCompression;
         sendBuffer.writeUint8(compression);
         let output = compression === PacketCompressionAlgorithm.Zlib ? deflateRawSync(message, { level: 1 }) : message;
         sendBuffer.writeSliceSpan(output);
      } else {
         sendBuffer.writeSliceSpan(message);
      }
      this.connection.send(sendBuffer.getProcessedBytes(), RakNetReliability.Reliable);
   }
}
function tryWriteUnknownSize<T>(type: SerializableType<T>, value: T, cursor: ResizableCursor): void {
   let pointerCheckpoint = cursor.pointer;
   while (true) {
      try {
         cursor.pointer = pointerCheckpoint;
         type.serialize(cursor, value);
         return;
      } catch (error) {
         if (error instanceof RangeError || cursor.availableSize <= 0) {
            cursor.grow();
            // Try again with bigger buffer
            continue;
         }

         throw error;
      }
   }
}
registerHandler(LoginPacket, packet => {
   const data = LoginTokensPayload.fromBytes(packet.payload);
   console.log(data);
});
