import { suite, test, expect } from 'vitest';

import {
   getUnconnectedPingTime,
   getUnconnectedPongInfo,
   rentUnconnectedPingBufferWith,
   rentUnconnectedPongBufferWith,
   readConnectedPingTime,
   rentConnectedPongBufferWith,
   readConnectedPongInfo,
   rentConnectedPingBufferWith,
} from './pong';

suite('Unconnected Ping', () => {
   test('should rent and read unconnected ping buffer', () => {
      const pingTime = 123456789n;
      const clientGuid = 987654321n;
      const buffer = rentUnconnectedPingBufferWith(pingTime, clientGuid);
      const readPingTime = getUnconnectedPingTime(new DataView(buffer.buffer));
      expect(readPingTime).toBe(pingTime);
   });
});

suite('Unconnected Pong', () => {
   test('should rent and read unconnected pong buffer', () => {
      const pingTime = 123456789n;
      const serverGuid = 987654321n;
      const message = new Uint8Array([1, 2, 3, 4, 5]);
      const buffer = rentUnconnectedPongBufferWith(pingTime, serverGuid, message);
      const {
         pingTime: readPingTime,
         guid: readGuid,
         message: readMessage,
      } = getUnconnectedPongInfo(new DataView(buffer.buffer));
      expect(readPingTime).toBe(pingTime);
      expect(readGuid).toBe(serverGuid);
      expect(readMessage).toEqual(message);
   });
});

suite('Connected Ping', () => {
   test('should rent and read connected ping buffer', () => {
      const pingTime = 123456789n;
      const buffer = rentConnectedPingBufferWith(pingTime);
      const readPingTime = readConnectedPingTime(new DataView(buffer.buffer));
      expect(readPingTime).toBe(pingTime);
   });
});

suite('Connected Pong', () => {
   test('should rent and read connected pong buffer', () => {
      const pingTime = 123456789n;
      const pongTime = 987654321n;
      const buffer = rentConnectedPongBufferWith(pingTime, pongTime);
      const { pingTime: readPingTime, pongTime: readPongTime } = readConnectedPongInfo(
         new DataView(buffer.buffer)
      );
      expect(readPingTime).toBe(pingTime);
      expect(readPongTime).toBe(pongTime);
   });
});
