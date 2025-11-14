import { RakNetReliability, ServerConnection } from '@carolina/raknet';
import { NetworkServer } from './server';
import { Cursor, ResizableCursor, SerializableType, VarInt } from '@carolina/binary';
import {
   PacketIds,
   NetworkSettingsPacket,
   PacketCompressionAlgorithm,
   RequestNetworkSettingsPacket,
   PacketType,
   PROTOCOL_VERSION,
   LoginPacket,
   LoginTokensPayload,
} from '@carolina/protocol';
import { deflateRawSync, inflateRawSync } from 'node:zlib';
import { HANDLERS, registerHandlers } from '../handlers/base';

export class NetworkConnection {
   static {
      registerHandlers(RequestNetworkSettingsPacket, (packet, connection) => {
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

         //
         connection.networkSettingsSet = true;
         console.log('Client protocol version: ', packet.clientNetworkVersion);
         console.log('Successfully handled');
      });
   }
   protected networkSettingsSet = false;
   protected readonly networkSettings = new NetworkSettingsPacket();
   public constructor(
      public readonly server: NetworkServer,
      public readonly connection: ServerConnection,
   ) {
      connection.onGamePacket = this.handlePayload.bind(this);
      this.networkSettings.compressionAlgorithm = PacketCompressionAlgorithm.Zlib;
      this.networkSettings.compressionThreshold = 256;
   }
   public handlePayload(message: Uint8Array): void {
      // Handle case the payload is prefixed by raknet game packet id
      if (message[0] === 0xfe) message = message.subarray(1);

      // This is always true once the connection is established
      if (this.networkSettingsSet) {
         //TODO - Implement encryption, encryption is done on top of the compression
         const compressionMethod = message[0];
         console.log(compressionMethod);
         if (compressionMethod === PacketCompressionAlgorithm.Snappy)
            throw new Error('Snappy compression is not supported');
         else if (compressionMethod === PacketCompressionAlgorithm.Zlib) {
            message = inflateRawSync(message.subarray(1) as Uint8Array<ArrayBuffer>);
            console.log('Was Compressed');
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

      // Depends on network settings were send it self
      if (this.networkSettingsSet) {
         // Select compression does depends on payload size
         const compression =
            message.length >= this.networkSettings.compressionThreshold
               ? this.networkSettings.compressionAlgorithm
               : PacketCompressionAlgorithm.NoCompression;

         // Write Compression Method
         sendBuffer.writeUint8(compression);

         // Prepare final payload
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
registerHandlers(LoginPacket, packet => {
   const data = LoginTokensPayload.fromBytes(packet.payload);
   //console.log(data);
   /*console.log({
      client: JSON.parse(data.authentication),
      text: JSON.parse(
         Buffer.from(data.data.substring(data.data.indexOf('.') + 1, data.data.lastIndexOf('.')), 'base64').toString(),
      ),
   });*/
   //console.log(data);
   console.log(JSON.parse(data.authentication));
   getJWTData(JSON.parse(data.authentication).Token);
});

function getJWTData<T extends object>(src: string): T {
   let indexOf = src.indexOf('.'),
      lastIndexOf = src.lastIndexOf('.');
   console.log(src.split('.').map(e => new TextDecoder().decode(Uint8Array.fromBase64(e))));
   console.log(new TextDecoder().decode(Uint8Array.fromBase64(src.substring(indexOf + 1, lastIndexOf))));
}
