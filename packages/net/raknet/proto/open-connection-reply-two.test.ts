import { suite, test, expect } from 'vitest';

import { ConnectionEndpoint } from '../../api/interface';
import { AddressInfo } from '../interfaces';
import {
   rentOpenConnectionReplyTwoBufferWith,
   readOpenConnectionReplyTwo,
} from './open-connection-reply-two';

suite('OpenConnectionReplyTwo', () => {
   test('should rent and read OpenConnectionReplyTwo buffer (IPv4)', () => {
      const serverGuid = 123456789n;
      const mtuSize = 1492;
      const clientAddress: ConnectionEndpoint = { address: '127.0.0.1', port: 19132 };
      const buffer = rentOpenConnectionReplyTwoBufferWith(serverGuid, clientAddress, mtuSize);
      const result = readOpenConnectionReplyTwo(new DataView(buffer.buffer));
      expect(result.serverGuid).toBe(serverGuid);
      expect(result.mtuSize).toBe(mtuSize);
      expect(result.clientAddress.address).toBe(clientAddress.address);
      expect(result.clientAddress.port).toBe(clientAddress.port);
   });

   test('should rent and read OpenConnectionReplyTwo buffer (IPv6)', () => {
      const serverGuid = 987654321n;
      const mtuSize = 1200;
      const clientAddress: ConnectionEndpoint = {
         address: '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
         port: 19133,
      };
      const buffer = rentOpenConnectionReplyTwoBufferWith(serverGuid, clientAddress, mtuSize);
      const result = readOpenConnectionReplyTwo(new DataView(buffer.buffer));
      expect(result.serverGuid).toBe(serverGuid);
      expect(result.mtuSize).toBe(mtuSize);
      expect(result.clientAddress.address).toBe(clientAddress.address);
      expect(result.clientAddress.port).toBe(clientAddress.port);
   });
});
