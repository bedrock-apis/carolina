import { MAGIC } from '../constants';
import { RakNetConnectedPacketId } from '../enums';
import { AddressInfo } from '../interfaces';
import { writeAddress } from './address';

const REQUEST_ACCEPTED_BUFFER = new Uint8Array(1 + 29 + 16 + 10 * 29 + 8 + 8);

// Set packetId
REQUEST_ACCEPTED_BUFFER[0] = RakNetConnectedPacketId.ConnectionRequestAccepted;

// has security is always false, mc doesn't not handles encryption on RakNet layer
REQUEST_ACCEPTED_BUFFER[1 + 16 + 8] = 0;

// Set magic
REQUEST_ACCEPTED_BUFFER.set(MAGIC, 1);

// Exclude packetId
const REQUEST_ACCEPTED_VIEW = new DataView(REQUEST_ACCEPTED_BUFFER.buffer);
export function rentConnectionRequestAcceptPacketWith(
   clientAddress: AddressInfo,
   serverAddress: AddressInfo,
   requestTime: bigint,
   serverTime: bigint,
): Uint8Array {
   // Client address
   let offset = writeAddress(REQUEST_ACCEPTED_VIEW, 1, clientAddress);

   // Client index
   REQUEST_ACCEPTED_VIEW.setUint16(offset, 0, false);
   offset += 2;
   offset = writeAddress(REQUEST_ACCEPTED_VIEW, offset, serverAddress); // 1x
   for (let i = 0; i < 9; i++) offset = writeEmptyIPv4(REQUEST_ACCEPTED_VIEW, offset); // 9xc   -->  10x Address

   // client request time
   REQUEST_ACCEPTED_VIEW.setBigUint64(offset, requestTime, false);
   REQUEST_ACCEPTED_VIEW.setBigUint64(offset + 8, serverTime, false);

   return REQUEST_ACCEPTED_BUFFER.subarray(0, offset + 16);
}
function writeEmptyIPv4(view: DataView, offset: number): number {
   // Ipv4
   view.setUint8(offset, 4); // version
   view.setUint32(offset + 1, 0xffffffff); // 4 bytes address
   view.setUint16(offset + 5, 0); // port
   return offset + 7;
}
