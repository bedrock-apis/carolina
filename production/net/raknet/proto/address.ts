import { AddressInfo } from '../interfaces';

export function writeAddress(dataview: DataView, offset: number, remoteInfo: AddressInfo): number {
   const isIpv4 = remoteInfo.family === 'IPv4';
   dataview.setUint8(offset++, isIpv4 ? 4 : 6);
   if (isIpv4) {
      dataview.setUint32(offset, ipv4ToNumber(remoteInfo.address), false);

      // write port
      dataview.setUint16((offset += 4), remoteInfo.port, false);

      //return new offset
      return offset + 2;
   }

   //Write IPv6 address
   dataview.setUint16(offset, 23, false); // not sure what it is
   dataview.setUint16((offset += 2), remoteInfo.port, false); // port
   dataview.setUint32((offset += 2), 0, false); //Session ip6 component

   // correct the offset after writing 32bit int
   offset += 4;

   const address_part = remoteInfo.address.split(':', 8);
   for (let i = 0; i < 8; i++, offset += 2) {
      const part = address_part[i];

      // If there are zero numbers cut
      if (part === '') {
         for (let n = 0; n < 8 - address_part.length; i++, offset += 2, n++) dataview.setUint16(offset, 0);
         dataview.setUint16(offset, 0);
         continue;
      }

      //else way
      dataview.setUint16(offset, Number.parseInt(part, 16));
   }
   dataview.setUint32(offset, 0); //Session ip6 component but idk actually

   //return new offset
   return offset + 4;
}
export function readAddress(view: DataView, offset: number): AddressInfo {
   const family = view.getUint8(offset++);
   const isIpv4 = family === 4;
   const address: AddressInfo = {
      family: isIpv4 ? 'IPv4' : 'IPv6',
      address: '',
      port: 0,
   };

   if (isIpv4) {
      // Read IPv4 address
      address.address = ipv4FromNumber(view.getUint32(offset, false));
      address.port = view.getUint16((offset += 4), false);
      offset += 2;
   } else {
      offset += 2; // skip address family
      address.port = view.getUint16(offset, false);
      offset += 2;
      offset += 4; // skip flow info
      address.address = new Array(8)
         .fill(0)
         .map((_, i) => {
            let v = view.getUint16(offset + (i << 1), false).toString(16);
            offset += 2;
            v;
         })
         .join(':');
   }

   return address;
}
export function parseIpv6AddressString(text: string): number[] {
   const address_part = text.split(':', 8);
   const parts = new Array<number>(8);
   for (let i = 0; i < 8; i++) {
      const part = address_part[i];
      // If there are zero numbers cut
      if (part === '') {
         for (let n = 0; n <= 8 - address_part.length && i < 8; i++, n++) parts[i] = 0;
         continue;
      }

      //else way
      parts[i] = Number.parseInt(part, 16);
   }
   return parts;
}
export function ipv4FromNumber(inverted: number): `${number}.${number}.${number}.${number}` {
   inverted = ~inverted;
   return `${(inverted >>> 24) & 0xff}.${(inverted >>> 16) & 0xff}.${(inverted >>> 8) & 0xff}.${inverted & 0xff}`;
}

export function ipv4ToNumber(address: string): number {
   const { 0: byte1, 1: byte2, 2: byte3, 3: byte4 } = address.split('.', 4);

   return ~(
      (Number.parseInt(byte1) << 24) |
      (Number.parseInt(byte2) << 16) |
      (Number.parseInt(byte3) << 8) |
      Number.parseInt(byte4)
   );
}
