import { nextTick } from 'node:process';
const start = performance.now();
nextTick(() => queueMicrotask(test('MicroFromNextTick')));
setTimeout(test('Timeout 1'), 1);
setTimeout(test('TimeoutZero'), 0);
setImmediate(test(setImmediate.name));
queueMicrotask(test(queueMicrotask.name));
nextTick(test(nextTick.name));
setTimeout(test('Timeout 1'), 1);
setTimeout(test('TimeoutZero'), 0);
setImmediate(test(setImmediate.name));
queueMicrotask(test(queueMicrotask.name));
nextTick(test(nextTick.name));
setTimeout(test('Timeout 1'), 1);
setTimeout(test('TimeoutZero'), 0);
setImmediate(test(setImmediate.name));
queueMicrotask(test(queueMicrotask.name));
nextTick(test(nextTick.name));
await undefined;
test('Await')();
function test(name: string): () => void {
   return () => console.log(name, 'Time:', (performance.now() - start).toFixed(2));
}
