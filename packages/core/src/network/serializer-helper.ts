import { Cursor } from '@carolina/binary';
import { DeferredRunner } from '@carolina/common';
import { PacketType } from '@carolina/protocol';

import { CachedImmediateMessage } from './immediate-packet';

export class SerializeHelper {
   public readonly cache = Cursor.create(new Uint8Array(1048576 * 32)); // 1M
   // Set immediate is always runs after queueMicrotask, so we can safely clear it
   protected readonly deferred = new DeferredRunner(setImmediate, () => this.cache.reset());
   public toCached(packet: PacketType): CachedImmediateMessage {
      return this.prepare(new CachedImmediateMessage(packet));
   }
   public prepare(cache: CachedImmediateMessage): CachedImmediateMessage {
      if (cache.cached) return cache;
      // We trigger clean up
      this.deferred.defer();
      const cursor = this.cache;
      const start = this.cache.pointer;
      cache.packet.serialize(cursor);
      cache.cached = cursor.buffer.subarray(start, cursor.pointer);
      return cache;
   }
}
