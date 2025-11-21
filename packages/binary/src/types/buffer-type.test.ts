import { expect, suite, test } from 'vitest';

import { Cursor } from '../cursor';
import { Buffer } from './buffer-type';
import { Int } from './numbers';

const cursor = Cursor.create(new Uint8Array(1 << 10));

suite('Buffer Type', () => {
   test('Buffer(Int)', () => {
      let c = crypto.getRandomValues(new Uint8Array(1 << 9));
      Buffer(Int).serialize(cursor, c);
      let p = cursor.pointer;
      cursor.pointer = 0;
      const c2 = Buffer(Int).deserialize(cursor);
      expect(c2).toEqual(c);
      expect(Buffer(Int)).toBe(Buffer(Int));
      expect(Buffer(Int, false)).not.toBe(Buffer(Int, true));
      expect(cursor.pointer).toBe(p);
   });
});
