import { expect, suite, test } from 'vitest';

import { RakNetUnconnectedPacketId } from '../enums';
import { rentAcknowledgePacketWith, readACKLikePacket } from './acknowledge';

suite('Acknowledge Packet', () => {
   test('rentAcknowledgePacketWith should serialize single range (min === max)', () => {
      const ranges = [{ min: 100, max: 100 }];
      const packet = rentAcknowledgePacketWith(RakNetUnconnectedPacketId.AckDatagram, ranges);

      expect(packet).toBeInstanceOf(Uint8Array);
      expect(packet.length).toBeGreaterThan(0);
      expect(packet[0]).toBe(RakNetUnconnectedPacketId.AckDatagram);
   });

   test('rentAcknowledgePacketWith should serialize multiple ranges', () => {
      const ranges = [
         { min: 0, max: 10 },
         { min: 20, max: 30 },
         { min: 50, max: 50 },
      ];
      const packet = rentAcknowledgePacketWith(RakNetUnconnectedPacketId.AckDatagram, ranges);

      expect(packet).toBeInstanceOf(Uint8Array);
      expect(packet[0]).toBe(RakNetUnconnectedPacketId.AckDatagram);
   });

   test('readACKLikePacket should deserialize single range correctly', () => {
      const ranges = [{ min: 100, max: 100 }];
      const packet = rentAcknowledgePacketWith(RakNetUnconnectedPacketId.AckDatagram, ranges);

      const result = readACKLikePacket(packet);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ min: 100, max: 100 });
   });

   test('readACKLikePacket should deserialize multiple ranges correctly', () => {
      const ranges = [
         { min: 0, max: 10 },
         { min: 20, max: 30 },
         { min: 50, max: 50 },
      ];
      const packet = rentAcknowledgePacketWith(RakNetUnconnectedPacketId.AckDatagram, ranges);

      const result = readACKLikePacket(packet);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({ min: 0, max: 10 });
      expect(result[1]).toEqual({ min: 20, max: 30 });
      expect(result[2]).toEqual({ min: 50, max: 50 });
   });

   test('should handle NackDatagram packet type', () => {
      const ranges = [{ min: 5, max: 15 }];
      const packet = rentAcknowledgePacketWith(RakNetUnconnectedPacketId.NackDatagram, ranges);

      expect(packet[0]).toBe(RakNetUnconnectedPacketId.NackDatagram);
      const result = readACKLikePacket(packet);
      expect(result[0]).toEqual({ min: 5, max: 15 });
   });

   test('should handle large range values', () => {
      const ranges = [
         { min: 1000000, max: 2000000 },
         { min: 3000000, max: 3000000 },
      ];
      const packet = rentAcknowledgePacketWith(RakNetUnconnectedPacketId.AckDatagram, ranges);

      const result = readACKLikePacket(packet);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ min: 1000000, max: 2000000 });
      expect(result[1]).toEqual({ min: 3000000, max: 3000000 });
   });

   test('should handle empty ranges', () => {
      const ranges: { min: number; max: number }[] = [];
      const packet = rentAcknowledgePacketWith(RakNetUnconnectedPacketId.AckDatagram, ranges);

      const result = readACKLikePacket(packet);

      expect(result).toHaveLength(0);
   });
});
