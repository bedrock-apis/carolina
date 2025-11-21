import { MAGIC } from '../constants';
import { RakNetConnectedPacketId, RakNetUnconnectedPacketId } from '../enums';

//#region  Unconnected
export function getUnconnectedPingTime(buffer: DataView): bigint {
   return (buffer as DataView).getBigUint64(1, false);
}
export function getUnconnectedPongInfo(buffer: DataView): { message: Uint8Array; guid: bigint; pingTime: bigint } {
   return {
      pingTime: buffer.getBigUint64(1, false),
      guid: buffer.getBigUint64(9, false),
      message: new Uint8Array(buffer.buffer, buffer.byteOffset + 16 + 16 + 1 + 2, buffer.getUint16(16 + 16 + 1, false)),
   };
}

const PONG_BUFFER = new Uint8Array(256);
PONG_BUFFER[0] = RakNetUnconnectedPacketId.UnconnectedPong;
PONG_BUFFER.set(MAGIC, 16 + 1);

const PONG_VIEW = new DataView(PONG_BUFFER.buffer, 1); // Exclude packetId
const PONG_MESSAGE_BUFFER_VIEW = PONG_BUFFER.subarray(1 + 16 + 16 + 2);

export function rentUnconnectedPongBufferWith(pingTime: bigint, serverGuid: bigint, message: Uint8Array): Uint8Array {
   // Set pong time
   PONG_VIEW.setBigUint64(0, pingTime, false);

   // Set server guid
   PONG_VIEW.setBigUint64(8, serverGuid, false);

   // Set message length and skip magic (+16)
   PONG_VIEW.setUint16(16 + 16, message.length, false);

   // Set message data at the end of the buffer
   PONG_MESSAGE_BUFFER_VIEW.set(message);

   // return rented buffer with correct length
   return PONG_BUFFER.subarray(0, 35 + message.length);
}
const PING_BUFFER = new Uint8Array(1 + 8 + 16 + 8);
PING_BUFFER[0] = RakNetUnconnectedPacketId.UnconnectedPing;
PING_BUFFER.set(MAGIC, 1 + 8);

const PING_VIEW = new DataView(PING_BUFFER.buffer, 1); // Exclude packetId

export function rentUnconnectedPingBufferWith(pingTime: bigint, clientGuid: bigint): Uint8Array {
   // Set pong time
   PING_VIEW.setBigUint64(0, pingTime, false);

   // Skip MAGIC
   // Set server guid
   PING_VIEW.setBigUint64(8 + 16, clientGuid, false);

   // return rented buffer with correct length
   return PING_BUFFER;
}

//#endregion

//#region Connected
export function getConnectedPingTime(buffer: DataView): bigint {
   return (buffer as DataView).getBigUint64(1, false);
}
const CONNECTED_PONG_BUFFER = new Uint8Array(1 + 8 + 8);
CONNECTED_PONG_BUFFER[0] = RakNetConnectedPacketId.ConnectedPong;
const CONNECTED_PONG_VIEW = new DataView(PONG_BUFFER.buffer, 1); // Exclude packetId
export function rentConnectedPongBufferWith(pingTime: bigint, pongTime: bigint): Uint8Array {
   // Set ping time
   CONNECTED_PONG_VIEW.setBigUint64(0, pingTime, false);

   // Set pong time
   CONNECTED_PONG_VIEW.setBigUint64(8, pongTime, false);

   // return rented buffer with correct length
   return CONNECTED_PONG_BUFFER;
}
//#endregion
