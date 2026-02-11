import { ConnectionEndpoint } from '../../api/interface';
import { MAGIC } from '../constants';
import { RakNetUnconnectedPacketId } from '../enums';
import { AddressInfo } from '../interfaces';
import { IPV4_ADDRESS_BINARY_SIZE, IPV6_ADDRESS_BINARY_SIZE, readAddress, writeAddress } from './address';

//#region Connection Request (Open Connection Request 1)

const CONNECTION_REQUEST_BUFFER = new Uint8Array(1 + 8 + 8 + 1);
CONNECTION_REQUEST_BUFFER[0] = RakNetUnconnectedPacketId.OpenConnectionRequestOne;
const CONNECTION_REQUEST_VIEW = new DataView(CONNECTION_REQUEST_BUFFER.buffer, 1); // Exclude packetId

export function rentConnectionRequestBufferWith(
   guid: bigint,
   time: bigint,
   useSecurity: boolean
): Uint8Array {
   // Set guid
   CONNECTION_REQUEST_VIEW.setBigUint64(0, guid, false);

   // Set time
   CONNECTION_REQUEST_VIEW.setBigUint64(8, time, false);

   // Set security flag
   CONNECTION_REQUEST_VIEW.setUint8(16, useSecurity ? 1 : 0);

   return CONNECTION_REQUEST_BUFFER;
}

export function readConnectionRequestInfo(raw: DataView): {
   guid: bigint;
   time: bigint;
   useSecurity: boolean;
} {
   return {
      // Skip first byte which is packet id
      guid: raw.getBigUint64(1, false),
      time: raw.getBigUint64(1 + 8, false),
      useSecurity: raw.getUint8(1 + 16) !== 0,
   };
}

//#endregion

//#region Open Connection Request 2

const OPEN_CONNECTION_REQUEST_TWO_BUFFER = new Uint8Array(1 + 16 + 29 + 2 + 8);
OPEN_CONNECTION_REQUEST_TWO_BUFFER[0] = RakNetUnconnectedPacketId.OpenConnectionRequestTwo;
OPEN_CONNECTION_REQUEST_TWO_BUFFER.set(MAGIC, 1);
const OPEN_CONNECTION_REQUEST_TWO_VIEW = new DataView(OPEN_CONNECTION_REQUEST_TWO_BUFFER.buffer, 1 + 16); // Exclude packetId and magic

export function rentOpenConnectionRequestTwoBufferWith(
   guid: bigint,
   serverAddress: AddressInfo,
   mtu: number
): Uint8Array {
   // Set server address
   let offset = writeAddress(OPEN_CONNECTION_REQUEST_TWO_VIEW, 0, serverAddress);

   // Set mtu
   OPEN_CONNECTION_REQUEST_TWO_VIEW.setUint16(offset, mtu, false);

   OPEN_CONNECTION_REQUEST_TWO_VIEW.setBigUint64((offset += 2), guid);

   return OPEN_CONNECTION_REQUEST_TWO_BUFFER.subarray(0, offset + 8);
}

export function readOpenConnectionRequestTwoInfo(raw: DataView): {
   guid: bigint;
   mtu: number;
   serverAddress: ConnectionEndpoint;
} {
   // get address version with hardcoded offset
   const address = readAddress(raw, 1 + 16);
   const toSkip = address.version === 4 ? IPV4_ADDRESS_BINARY_SIZE : IPV6_ADDRESS_BINARY_SIZE;
   return {
      serverAddress: address,
      mtu: raw.getUint16(1 + 16 + toSkip),
      guid: raw.getBigUint64(1 + 16 + 2 + toSkip),
   };
}

//#endregion
