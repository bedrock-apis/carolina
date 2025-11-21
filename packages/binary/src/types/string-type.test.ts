import { expect, suite, test } from 'vitest';

import { Cursor } from '../cursor';
import { Int } from './numbers';
import { Str } from './string-type';

const cursor = Cursor.create(new Uint8Array(1 << 10));

suite('String Type', () => {
   test('Str(Int)', () => {
      let c = crypto.randomUUID();
      Str(Int).serialize(cursor, c);
      let p = cursor.pointer;
      cursor.pointer = 0;
      const c2 = Str(Int).deserialize(cursor);
      expect(c2).toBe(c);
      expect(Str(Int)).toBe(Str(Int));
      expect(Str(Int, false)).not.toBe(Str(Int, true));
      expect(cursor.pointer).toBe(p);
   });
});
