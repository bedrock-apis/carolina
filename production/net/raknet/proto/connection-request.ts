import { AddressInfo } from '../interfaces';
import { readAddress } from './address';

export function getConnectionRequestInfo(raw: DataView): {
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
export function getOpenConnectionRequestTwoInfo(raw: DataView): {
   guid: bigint;
   mtu: number;
   serverAddress: AddressInfo;
} {
   // get address version with hardcoded offset
   const address = readAddress(raw, 1 + 16);
   const toSkip = address.family === 'IPv4' ? 7 : 29;
   return {
      serverAddress: address,
      mtu: raw.getUint16(1 + 16 + toSkip),
      guid: raw.getBigUint64(1 + 16 + 2 + toSkip),
   };
}
