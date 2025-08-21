import { IS_FRAGMENTED_BIT, IS_ORDERED_LOOKUP, IS_RELIABLE_LOOKUP, IS_SEQUENCED_LOOKUP } from '../constants';
import { RakNetReliability } from '../enums';
import { FrameDescriptor } from '../interfaces';
import { readUint24, writeUint24 } from './uint24';

export function readCapsuleFrameData(view: DataView, offset: number): { offset: number } & FrameDescriptor {
   const result: FrameDescriptor & { offset: number } = {
      body: null!,
      offset,
   };
   const header = view.getUint8(offset++);

   // First top 3bits of the byte 8-5 = 3
   const reliability = header >> 5;

   // get is fragmented by bit check
   const isFragmented = (header & IS_FRAGMENTED_BIT) === IS_FRAGMENTED_BIT;

   // body length in bits, so >>3 bit shift makes it in bytes
   const bodyLength = view.getUint16(offset) >> 3;
   offset += 2;

   // Check if the frame is reliable.
   // If so, read the reliable index.
   if (IS_RELIABLE_LOOKUP[reliability]) {
      result.reliableIndex = readUint24(view, offset);
      offset += 3;
   }

   // Check if the frame is sequenced.
   // If so, read the sequence index.
   if (IS_SEQUENCED_LOOKUP[reliability]) {
      result.sequenceIndex = readUint24(view, offset);
      offset += 3;
   }

   // Check if the frame is ordered.
   // If so, read the order index and channel.
   if (IS_ORDERED_LOOKUP[reliability]) {
      result.orderIndex = readUint24(view, offset);
      offset += 3;
      result.orderChannel = view.getUint8(offset++);
   }

   if (isFragmented) {
      const fragment = (result.fragment = {} as typeof result.fragment)!;
      fragment.length = view.getUint32(offset);
      offset += 4;
      fragment.id = view.getUint16(offset);
      offset += 2;
      fragment.index = view.getUint32(offset);
      offset += 4;
   }

   result.body = new Uint8Array(view.buffer, view.byteOffset + offset, bodyLength);
   result.offset = offset += bodyLength;
   return result;
}
export function writeCapsuleFrameHeader(
   view: DataView,
   desc: Omit<FrameDescriptor, 'body'>,
   bodyLength: number,
   reliability: RakNetReliability,
): number {
   let offset = 0;

   let header = reliability << 5;
   if (desc.fragment) header |= IS_FRAGMENTED_BIT;
   view.setUint8(offset++, header);

   // body length is not in bits, so 3<< bit shift makes it in bytes
   view.setUint16(offset, bodyLength << 3, false);
   offset += 2;

   // Check if the frame is reliable.
   // If so, read the reliable index.
   if (IS_RELIABLE_LOOKUP[reliability]) {
      writeUint24(view, offset, desc.reliableIndex ?? 0);
      offset += 3;
   }

   // Check if the frame is sequenced.
   // If so, read the sequence index.
   if (IS_SEQUENCED_LOOKUP[reliability]) {
      writeUint24(view, offset, desc.sequenceIndex ?? 0);
      offset += 3;
   }

   // Check if the frame is ordered.
   // If so, read the order index and channel.
   if (IS_ORDERED_LOOKUP[reliability]) {
      writeUint24(view, offset, desc.orderIndex ?? 0);
      offset += 3;
      view.setUint8(offset++, desc.orderChannel ?? 0);
   }

   if (desc.fragment) {
      const { id, index, length } = desc.fragment;
      view.setUint32(offset, length, false);
      offset += 4;
      view.setUint16(offset, id, false);
      offset += 2;
      view.setUint32(offset, index, false);
      offset += 4;
   }

   return offset;
}
