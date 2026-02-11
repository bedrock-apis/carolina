// Import dependencies
import { MAGIC } from '../constants';
import { RakNetUnconnectedPacketId } from '../enums';

// Buffer for OpenConnectionReplyOne
const REPLY_BUFFER = new Uint8Array(1 + 16 + 8 + 1 + 2);
REPLY_BUFFER[0] = RakNetUnconnectedPacketId.OpenConnectionReplyOne;
REPLY_BUFFER.set(MAGIC, 1); // Set magic
REPLY_BUFFER[1 + 16 + 8] = 0; // No encryption

// DataView for OpenConnectionReplyOne
const REPLY_VIEW = new DataView(REPLY_BUFFER.buffer, 1);

// Rent function for OpenConnectionReplyOne
export function rentOpenConnectionReplyOneBufferWith(serverGuid: bigint, mtuSize: number): Uint8Array {
   REPLY_VIEW.setBigUint64(16, serverGuid, false);
   REPLY_VIEW.setUint16(16 + 8 + 1, mtuSize, false);
   return REPLY_BUFFER;
}

// Read function for OpenConnectionReplyOne
export function readOpenConnectionReplyOne(buffer: DataView): { serverGuid: bigint; mtuSize: number } {
   const serverGuid = buffer.getBigUint64(16 + 1, false);
   const mtuSize = buffer.getUint16(16 + 8 + 1 + 1, false);
   return { serverGuid, mtuSize };
}
