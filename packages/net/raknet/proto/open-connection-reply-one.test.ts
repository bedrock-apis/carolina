import { suite, test, expect } from 'vitest';

import {
   rentOpenConnectionReplyOneBufferWith,
   readOpenConnectionReplyOne,
} from './open-connection-reply-one';

suite('OpenConnectionReplyOne', () => {
   test('should rent and read OpenConnectionReplyOne buffer', () => {
      const serverGuid = 123456789n;
      const mtuSize = 1492;
      const buffer = rentOpenConnectionReplyOneBufferWith(serverGuid, mtuSize);
      const result = readOpenConnectionReplyOne(new DataView(buffer.buffer));
      expect(result.serverGuid).toBe(serverGuid);
      expect(result.mtuSize).toBe(mtuSize);
   });
});
