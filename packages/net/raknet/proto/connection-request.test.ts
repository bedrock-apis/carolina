import { expect, suite, test } from 'vitest';

import { AddressInfo } from '../interfaces';
import {
   rentConnectionRequestBufferWith,
   readConnectionRequestInfo,
   rentOpenConnectionRequestTwoBufferWith,
   readOpenConnectionRequestTwoInfo,
} from './connection-request';

suite('Connection Request (Open Connection Request 1)', () => {
   test('rentConnectionRequestBufferWith should serialize correctly', () => {
      const guid = 12345678n;
      const time = 1000000n;
      const useSecurity = false;

      const packet = rentConnectionRequestBufferWith(guid, time, useSecurity);

      expect(packet).toBeInstanceOf(Uint8Array);
      expect(packet.length).toBe(1 + 8 + 8 + 1);
   });

   test('readConnectionRequestInfo should deserialize correctly', () => {
      const guid = 9876543210n;
      const time = 5000000n;
      const useSecurity = true;

      const packet = rentConnectionRequestBufferWith(guid, time, useSecurity);
      const view = new DataView(packet.buffer);
      const result = readConnectionRequestInfo(view);

      expect(result.guid).toBe(guid);
      expect(result.time).toBe(time);
      expect(result.useSecurity).toBe(useSecurity);
   });

   test('should handle useSecurity false', () => {
      const guid = 111111n;
      const time = 222222n;

      const packet = rentConnectionRequestBufferWith(guid, time, false);
      const view = new DataView(packet.buffer);
      const result = readConnectionRequestInfo(view);

      expect(result.useSecurity).toBe(false);
   });

   test('should handle useSecurity true', () => {
      const guid = 333333n;
      const time = 444444n;

      const packet = rentConnectionRequestBufferWith(guid, time, true);
      const view = new DataView(packet.buffer);
      const result = readConnectionRequestInfo(view);

      expect(result.useSecurity).toBe(true);
   });

   test('should handle large guid values', () => {
      const guid = 9223372036854775807n; // Max safe BigInt
      const time = 9223372036854775800n;

      const packet = rentConnectionRequestBufferWith(guid, time, false);
      const view = new DataView(packet.buffer);
      const result = readConnectionRequestInfo(view);

      expect(result.guid).toBe(guid);
      expect(result.time).toBe(time);
   });
});

suite('Open Connection Request 2', () => {
   test('rentOpenConnectionRequestTwoBufferWith should serialize IPv4 correctly', () => {
      const guid = 12345678n;
      const serverAddress: AddressInfo = { family: 'IPv4', address: '127.0.0.1', port: 19132 };
      const mtu = 1500;

      const packet = rentOpenConnectionRequestTwoBufferWith(guid, serverAddress, mtu);

      expect(packet).toBeInstanceOf(Uint8Array);
      expect(packet.length).toBeGreaterThan(0);
   });

   test('rentOpenConnectionRequestTwoBufferWith should serialize IPv6 correctly', () => {
      const guid = 87654321n;
      const serverAddress: AddressInfo = { family: 'IPv6', address: '::1', port: 19133 };
      const mtu = 1280;

      const packet = rentOpenConnectionRequestTwoBufferWith(guid, serverAddress, mtu);

      expect(packet).toBeInstanceOf(Uint8Array);
      expect(packet.length).toBeGreaterThan(0);
   });

   test('readOpenConnectionRequestTwoInfo should deserialize IPv4 correctly', () => {
      const guid = 555555n;
      const serverAddress: AddressInfo = { family: 'IPv4', address: '192.168.1.1', port: 19134 };
      const mtu = 1500;

      const packet = rentOpenConnectionRequestTwoBufferWith(guid, serverAddress, mtu);
      const view = new DataView(packet.buffer);
      const result = readOpenConnectionRequestTwoInfo(view);

      expect(result.guid).toBe(guid);
      expect(result.serverAddress.address).toBe(serverAddress.address);
      expect(result.serverAddress.port).toBe(serverAddress.port);
      expect(result.mtu).toBe(mtu);
   });

   test('readOpenConnectionRequestTwoInfo should deserialize IPv6 correctly', () => {
      const guid = 999999n;
      const serverAddress: AddressInfo = {
         family: 'IPv6',
         address: '2001:0db8:0000:0000:0000:0000:0000:0000',
         port: 19135,
      };
      const mtu = 1280;

      const packet = rentOpenConnectionRequestTwoBufferWith(guid, serverAddress, mtu);
      const view = new DataView(packet.buffer);
      const result = readOpenConnectionRequestTwoInfo(view);

      expect(result.guid).toBe(guid);
      expect(result.serverAddress.address).toBe(serverAddress.address);
      expect(result.serverAddress.port).toBe(serverAddress.port);
      expect(result.mtu).toBe(mtu);
   });

   test('should handle different MTU values', () => {
      const guid = 111n;
      const serverAddress: AddressInfo = { family: 'IPv4', address: '10.0.0.1', port: 25565 };
      const mtuValues = [512, 1280, 1500, 65535];

      for (const mtu of mtuValues) {
         const packet = rentOpenConnectionRequestTwoBufferWith(guid, serverAddress, mtu);
         const view = new DataView(packet.buffer);
         const result = readOpenConnectionRequestTwoInfo(view);

         expect(result.mtu).toBe(mtu);
      }
   });
});
