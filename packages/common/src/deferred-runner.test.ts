import { suite, test, expect, vi } from 'vitest';

import { DeferredRunner } from './deferred-runner';

suite('DeferredRunner', () => {
   test('runs immediately', () => {
      const task = vi.fn();
      const scheduler = vi.fn(queueMicrotask);
      const runner = new DeferredRunner(scheduler, task);

      runner.run();

      expect(task).toHaveBeenCalledTimes(1);
      expect(scheduler).toHaveBeenCalledTimes(0);
   });

   test('defers execution', async () => {
      const task = vi.fn();
      const scheduler = vi.fn(queueMicrotask);
      const runner = new DeferredRunner(scheduler, task);

      runner.defer();

      expect(task).toHaveBeenCalledTimes(0);

      await new Promise<void>(resolve => queueMicrotask(resolve));

      expect(task).toHaveBeenCalledTimes(1);
      expect(scheduler).toHaveBeenCalledTimes(1);
   });

   test('cancels deferred on run', async () => {
      const task = vi.fn();
      const scheduler = vi.fn(queueMicrotask);
      const runner = new DeferredRunner(scheduler, task);

      runner.defer();
      runner.run();

      expect(task).toHaveBeenCalledTimes(1);

      await new Promise<void>(resolve => queueMicrotask(resolve));

      expect(task).toHaveBeenCalledTimes(1);
      expect(scheduler).toHaveBeenCalledTimes(1);
   });

   test('ignores duplicate defers', async () => {
      const task = vi.fn();
      const scheduler = vi.fn(queueMicrotask);
      const runner = new DeferredRunner(scheduler, task);

      runner.defer();
      runner.defer();

      await new Promise<void>(resolve => queueMicrotask(resolve));

      expect(task).toHaveBeenCalledTimes(1);
      expect(scheduler).toHaveBeenCalledTimes(1);
   });

   test('defer/run/defer with single schedule', async () => {
      const task = vi.fn();
      const scheduler = vi.fn(queueMicrotask);
      const runner = new DeferredRunner(scheduler, task);

      runner.defer();
      runner.run();
      runner.defer();

      await new Promise<void>(resolve => queueMicrotask(resolve));

      expect(task).toHaveBeenCalledTimes(2);
      expect(scheduler).toHaveBeenCalledTimes(1);
   });
});
