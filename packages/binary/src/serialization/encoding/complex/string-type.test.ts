import { expect, suite, test } from 'vitest';

import { Cursor } from '../../../cursor';
import { Int32 } from '../numerics';
import { String } from './string-type';

const cursor = Cursor.create(new Uint8Array(1 << 10));

suite('String Type', () => {
   test('Str(Int)', () => {
      let c = crypto.randomUUID();
      String(Int32).serialize(cursor, c);
      let p = cursor.pointer;
      cursor.pointer = 0;
      const c2 = String(Int32).deserialize(cursor);
      expect(c2).toBe(c);
      expect(String(Int32)).toBe(String(Int32));
      expect(String(Int32, false)).not.toBe(String(Int32, true));
      expect(cursor.pointer).toBe(p);
   });
});
