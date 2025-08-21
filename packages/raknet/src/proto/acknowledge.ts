import { RakNetUnconnectedPacketId } from '../enums';
import { readUint24, writeUint24 } from './uint24';

const ACK_BUFFER = new Uint8Array(256);

const VIEW = new DataView(ACK_BUFFER.buffer);

export function rentAcknowledgePacketWith(
   kind: RakNetUnconnectedPacketId.AckDatagram | RakNetUnconnectedPacketId.NackDatagram,
   ranges: Iterable<{ max: number; min: number }>,
): Uint8Array {
   // Packet Id
   ACK_BUFFER[0] = kind;
   let count = 0,
      offset = 1 + 2;
   for (const { max, min } of ranges) {
      // Write Min
      writeUint24(VIEW, offset + 1, min);

      // Skip max if the max === min
      if (!((ACK_BUFFER[offset] as unknown) = max === min)) {
         writeUint24(VIEW, offset + 1 + 3, max);
         offset += 3 + 3 + 1;
      } else offset += 3 + 1;
      count++;
   }

   // Write Count
   VIEW.setUint16(1, count, false);

   // return rented buffer with correct length
   return ACK_BUFFER.subarray(0, offset);
}

export function readACKLikePacket(buffer: Uint8Array): { min: number; max: number }[] {
   // Skip packet id
   let offset = 1;
   const dataView = new DataView(buffer.buffer, buffer.byteOffset);

   // read number of ranges
   const count = dataView.getUint16(offset, false);
   offset += 2;

   const results = new Array<{ min: number; max: number }>(count);
   // read ranges
   for (let i = 0; i < count; i++) {
      const isSingle = dataView.getUint8(offset++);
      let min = readUint24(dataView, offset);
      offset += 3;

      // Just life hack to make it inlined
      if (isSingle && (results[i] = { min, max: min })) continue;

      results[i] = { min, max: readUint24(dataView, offset) };
      offset += 3;
   }
   return results;
}
