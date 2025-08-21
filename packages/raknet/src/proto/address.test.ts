import { expect, suite, test } from 'vitest';
import { ipv4FromNumber, ipv4ToNumber } from './address';

suite('Basic', () => {
   test('Number to Number', () => {
      let n = ~~(Math.random() * 0xffff_ffff);
      let p = '21.32.235.213';
      expect(ipv4ToNumber(ipv4FromNumber(n))).toBe(n);
      expect(ipv4FromNumber(ipv4ToNumber(p))).toBe(p);
   });
});
