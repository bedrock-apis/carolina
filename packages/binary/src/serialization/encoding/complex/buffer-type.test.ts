import { expect, suite, test } from 'vitest';

import { Cursor } from '../../../cursor';
import { Int32 } from '../numerics';
import { Buffer } from './buffer-type';

const cursor = Cursor.create(new Uint8Array(1 << 10));

suite('Buffer Type', () => {
   test('Buffer(Int)', () => {
      let c = crypto.getRandomValues(new Uint8Array(1 << 9));
      Buffer(Int32).serialize(cursor, c);
      let p = cursor.pointer;
      cursor.pointer = 0;
      const c2 = Buffer(Int32).deserialize(cursor);
      expect(c2).toEqual(c);
      expect(Buffer(Int32)).toBe(Buffer(Int32));
      expect(Buffer(Int32, false)).not.toBe(Buffer(Int32, true));
      expect(cursor.pointer).toBe(p);
   });
});
