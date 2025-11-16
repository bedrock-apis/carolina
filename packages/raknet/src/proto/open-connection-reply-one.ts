import { MAGIC } from '../constants';
import { RakNetUnconnectedPacketId } from '../enums';

const REPLY_BUFFER = new Uint8Array(1 + 16 + 8 + 1 + 2);

// Set packetId
REPLY_BUFFER[0] = RakNetUnconnectedPacketId.OpenConnectionReplyOne;

// has security is always false, mc doesn't not handles encryption on RakNet layer
REPLY_BUFFER[1 + 16 + 8] = 0;

// Set magic
REPLY_BUFFER.set(MAGIC, 1);

// Exclude packetId
const PONG_VIEW = new DataView(REPLY_BUFFER.buffer, 1);

export function rentOpenConnectionReplyOneBufferWith(serverGuid: bigint, mtuSize: number): Uint8Array {
   // Set server guid
   PONG_VIEW.setBigUint64(16, serverGuid, false);

   // Set message length and skip magic (+16)
   PONG_VIEW.setUint16(16 + 8 + 1, mtuSize, false);

   // return rented buffer with correct length
   return REPLY_BUFFER;
}
