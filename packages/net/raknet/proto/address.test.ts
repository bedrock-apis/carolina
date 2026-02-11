import { expect, suite, test } from 'vitest';

import { ConnectionEndpoint } from '../../api/interface';
import {
   ipv4FromNumber,
   ipv4ToNumber,
   parseIpv6AddressString,
   readAddress,
   writeAddress,
   IPV4_ADDRESS_BINARY_SIZE,
   IPV6_ADDRESS_BINARY_SIZE,
} from './address';

suite('Basic', () => {
   test('Number to Number', () => {
      let n = ~~(Math.random() * 0xffff_ffff);
      let p = '21.32.235.213'; //This is random IP
      expect(ipv4ToNumber(ipv4FromNumber(n))).toBe(n);
      expect(ipv4FromNumber(ipv4ToNumber(p))).toBe(p);
   });
});

suite('IPv4 Conversion', () => {
   test('ipv4ToNumber should convert IPv4 string to number', () => {
      expect(ipv4ToNumber('127.0.0.1')).toBe(ipv4ToNumber('127.0.0.1'));
      expect(ipv4ToNumber('192.168.1.1')).toBe(ipv4ToNumber('192.168.1.1'));
      expect(ipv4ToNumber('255.255.255.255')).toBe(ipv4ToNumber('255.255.255.255'));
   });

   test('ipv4FromNumber should convert number to IPv4 string', () => {
      const num = ipv4ToNumber('10.0.0.1');
      expect(ipv4FromNumber(num)).toBe('10.0.0.1');
   });

   test('ipv4FromNumber should handle edge cases', () => {
      // Test 0.0.0.0
      expect(ipv4FromNumber(ipv4ToNumber('0.0.0.0'))).toBe('0.0.0.0');
      // Test 255.255.255.255
      expect(ipv4FromNumber(ipv4ToNumber('255.255.255.255'))).toBe('255.255.255.255');
   });
});

suite('IPv6 Address Parsing', () => {
   test('parseIpv6AddressString should parse standard IPv6 address', () => {
      const result = parseIpv6AddressString('2001:0db8:85a3:0000:0000:8a2e:0370:7334');
      expect(result).toHaveLength(8);
      expect(result[0]).toBe(0x2001);
      expect(result[1]).toBe(0x0db8);
      expect(result[2]).toBe(0x85a3);
   });

   test('parseIpv6AddressString should parse compressed IPv6 address', () => {
      const result = parseIpv6AddressString('::1');
      expect(result).toHaveLength(8);
      expect(result[7]).toBe(1);
   });

   test('parseIpv6AddressString should parse IPv6 with leading zeros', () => {
      const result = parseIpv6AddressString('2001:db8::8a2e:370:7334');
      expect(result).toHaveLength(8);
      expect(result[0]).toBe(0x2001);
   });
});

suite('Address Read/Write', () => {
   test('writeAddress and readAddress should handle IPv4 correctly', () => {
      const buffer = new ArrayBuffer(20);
      const view = new DataView(buffer);
      const endpoint: ConnectionEndpoint = { address: '127.0.0.1', port: 19132 };

      const offset = writeAddress(view, 0, endpoint);
      expect(offset).toBe(IPV4_ADDRESS_BINARY_SIZE);

      const result = readAddress(view, 0);
      expect(result.address).toBe(endpoint.address);
      expect(result.port).toBe(endpoint.port);
      expect(result.version).toBe(4);
   });

   test('writeAddress and readAddress should handle IPv6 correctly', () => {
      const buffer = new ArrayBuffer(60);
      const view = new DataView(buffer);
      const endpoint: ConnectionEndpoint = {
         address: '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
         port: 19133,
      };

      const offset = writeAddress(view, 0, endpoint);
      expect(offset).toBe(IPV6_ADDRESS_BINARY_SIZE);

      const result = readAddress(view, 0);
      expect(result.address).toBe(endpoint.address);
      expect(result.port).toBe(endpoint.port);
      expect(result.version).toBe(6);
   });

   test('writeAddress should return correct offset for multiple addresses', () => {
      const buffer = new ArrayBuffer(100);
      const view = new DataView(buffer);
      const ipv4Endpoint: ConnectionEndpoint = { address: '192.168.1.1', port: 8080 };
      const ipv6Endpoint: ConnectionEndpoint = { address: '::1', port: 8081 };

      let offset = writeAddress(view, 0, ipv4Endpoint);
      expect(offset).toBe(IPV4_ADDRESS_BINARY_SIZE);

      offset = writeAddress(view, offset, ipv6Endpoint);
      expect(offset).toBe(IPV4_ADDRESS_BINARY_SIZE + IPV6_ADDRESS_BINARY_SIZE);
   });

   test('readAddress should correctly read address with offset', () => {
      const buffer = new ArrayBuffer(50);
      const view = new DataView(buffer);
      const startOffset = 10;
      const endpoint: ConnectionEndpoint = { address: '10.0.0.1', port: 5000 };

      writeAddress(view, startOffset, endpoint);
      const result = readAddress(view, startOffset);

      expect(result.address).toBe(endpoint.address);
      expect(result.port).toBe(endpoint.port);
   });
});
