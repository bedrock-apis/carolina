import { expect, suite, test } from 'vitest';

import { AddressInfo } from '../interfaces';
import {
   rentConnectionRequestAcceptPacketWith,
   readConnectionRequestAcceptPacket,
} from './connection-request-accepted';

suite('Connection Request Accepted Packet', () => {
   const clientAddress: AddressInfo = { family: 'IPv4', address: '127.0.0.1', port: 19132 };

   const serverAddress: AddressInfo = { family: 'IPv4', address: '192.168.1.1', port: 19133 };

   const requestTime = 1234567890n;
   const serverTime = 9876543210n;

   test('rentConnectionRequestAcceptPacketWith should serialize correctly', () => {
      const packet = rentConnectionRequestAcceptPacketWith(
         clientAddress,
         serverAddress,
         requestTime,
         serverTime
      );

      expect(packet).toBeInstanceOf(Uint8Array);
      expect(packet.length).toBeGreaterThan(0);
   });

   test('readConnectionRequestAcceptPacket should deserialize correctly', () => {
      const packet = rentConnectionRequestAcceptPacketWith(
         clientAddress,
         serverAddress,
         requestTime,
         serverTime
      );

      const view = new DataView(packet.buffer);
      const result = readConnectionRequestAcceptPacket(view);

      expect(result.clientAddress.address).toBe(clientAddress.address);
      expect(result.clientAddress.port).toBe(clientAddress.port);
      expect(result.clientIndex).toBe(0);
      expect(result.serverAddress.address).toBe(serverAddress.address);
      expect(result.serverAddress.port).toBe(serverAddress.port);
      expect(result.requestTime).toBe(requestTime);
      expect(result.serverTime).toBe(serverTime);
   });
});
