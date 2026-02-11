function benchmark(label: string, fn: () => void): void {
   const start = process.hrtime.bigint();
   fn();
   const end = process.hrtime.bigint();
   const durationMs = Number(end - start) / 1_000_000;
   console.log(`${label}: ${durationMs.toFixed(3)} ms`);
}

const iterations = 10_000;
const prependSize = 10;
const payload = Array.from({ length: prependSize }, (_, i) => i);

benchmark('push', () => {
   const arr: number[] = [];
   for (let i = 0; i < iterations; i++) {
      arr.push(...payload);
   }
});

benchmark('unshift', () => {
   const arr: number[] = [];
   for (let i = 0; i < iterations; i++) {
      arr.unshift(...payload);
   }
});

benchmark('concat', () => {
   letarr: number[] = [];
   for (let i = 0; i < iterations; i++) {
      arr = payload.concat(arr);
   }
});
