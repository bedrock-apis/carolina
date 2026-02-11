// Import dependencies
import { ConnectionEndpoint } from '../../api/interface';
import { MAGIC } from '../constants';
import { RakNetUnconnectedPacketId } from '../enums';
import { writeAddress, readAddress, IPV4_ADDRESS_BINARY_SIZE, IPV6_ADDRESS_BINARY_SIZE } from './address';

// Buffer for OpenConnectionReplyTwo
const REPLY_BUFFER = new Uint8Array(1 + 16 + 8 + 29 + 2 + 1);
REPLY_BUFFER[0] = RakNetUnconnectedPacketId.OpenConnectionReplyTwo;
REPLY_BUFFER.set(MAGIC, 1); // Set magic

// DataView for OpenConnectionReplyTwo
const REPLY_VIEW = new DataView(REPLY_BUFFER.buffer, 1);

// Rent function for OpenConnectionReplyTwo
export function rentOpenConnectionReplyTwoBufferWith(
   serverGuid: bigint,
   clientAddress: ConnectionEndpoint,
   mtuSize: number
): Uint8Array {
   REPLY_VIEW.setBigUint64(16, serverGuid, false);
   let offset = 16 + 8;
   offset = writeAddress(REPLY_VIEW, offset, clientAddress);
   REPLY_VIEW.setUint16(offset, mtuSize, false);
   REPLY_VIEW.setUint8(offset + 2, 0); // No encryption
   return REPLY_BUFFER.subarray(0, offset + 3);
}

// Read function for OpenConnectionReplyTwo
export function readOpenConnectionReplyTwo(buffer: DataView): {
   serverGuid: bigint;
   clientAddress: ConnectionEndpoint;
   mtuSize: number;
} {
   const serverGuid = buffer.getBigUint64(16 + 1, false);
   let offset = 16 + 8 + 1;
   const clientAddress = readAddress(buffer, offset);
   offset += clientAddress.version === 4 ? IPV4_ADDRESS_BINARY_SIZE : IPV6_ADDRESS_BINARY_SIZE; // Address size
   const mtuSize = buffer.getUint16(offset, false);
   return { serverGuid, clientAddress, mtuSize };
}
