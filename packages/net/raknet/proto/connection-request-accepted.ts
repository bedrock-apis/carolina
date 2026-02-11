import { ConnectionEndpoint } from '../../api/interface';
import { MAGIC, SYSTEM_ADDRESS_COUNT } from '../constants';
import { RakNetConnectedPacketId } from '../enums';
import { IPV4_ADDRESS_BINARY_SIZE, IPV6_ADDRESS_BINARY_SIZE, readAddress, writeAddress } from './address';

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
   clientAddress: ConnectionEndpoint,
   serverAddress: ConnectionEndpoint,
   requestTime: bigint,
   serverTime: bigint
): Uint8Array {
   // Client address
   let offset = writeAddress(REQUEST_ACCEPTED_VIEW, 1, clientAddress);

   // Client index
   REQUEST_ACCEPTED_VIEW.setUint16(offset, 0, false);
   offset += 2;
   offset = writeAddress(REQUEST_ACCEPTED_VIEW, offset, serverAddress); // 1x
   for (let i = 0; i < SYSTEM_ADDRESS_COUNT - 1; i++) offset = writeEmptyIPv4(REQUEST_ACCEPTED_VIEW, offset); // 9xc   -->  10x Address

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

export function readConnectionRequestAcceptPacket(view: DataView): {
   clientAddress: ConnectionEndpoint;
   clientIndex: number;
   serverAddress: ConnectionEndpoint;
   requestTime: bigint;
   serverTime: bigint;
} {
   // Hardcoded offsets for maximum performance
   let offset = 1; // Starts after packetId
   const clientAddress = readAddress(view, offset);
   offset += clientAddress.version === 4 ? IPV4_ADDRESS_BINARY_SIZE : IPV6_ADDRESS_BINARY_SIZE;

   const clientIndex = view.getUint16(offset, false);
   offset += 2; // Client index is 2 bytes

   console.log(view.getUint8(offset));
   const serverAddress = readAddress(view, offset);
   offset += clientAddress.version === 4 ? IPV4_ADDRESS_BINARY_SIZE : IPV6_ADDRESS_BINARY_SIZE;

   // Loop through the 10 addresses
   for (let i = 0; i < SYSTEM_ADDRESS_COUNT - 1; i++) {
      const version = view.getUint8(offset);
      if (version === 4)
         offset += IPV4_ADDRESS_BINARY_SIZE; // IPv4 address size
      else if (version === 6)
         offset += IPV6_ADDRESS_BINARY_SIZE; // IPv6 address size
      else throw new Error('Unsupported address version in loop v' + version);
   }

   const requestTime = view.getBigUint64(offset, false);
   offset += 8; // Request time is 8 bytes

   const serverTime = view.getBigUint64(offset, false);
   offset += 8; // Server time is 8 bytes

   return { clientAddress, clientIndex, serverAddress, requestTime, serverTime };
}
