// --- Timer functions to benchmark ---
const timers = {
   'Date.now': Date.now,
   'performance.now': () => performance.now(),
   'process.hrtime.bigint': process.hrtime.bigint,
   'Bun.nanoseconds': Bun.nanoseconds, // Bun-specific
};

// --- Benchmark runner ---
function runBenchmark(iterations = 10_000_000): any {
   const results = {};

   for (const [name, fn] of Object.entries(timers)) {
      const start = process.hrtime.bigint();
      for (let i = 0; i < iterations; i++) fn();
      const end = process.hrtime.bigint();

      const durationNs = end - start;
      const durationMs = Number(durationNs) / 1e6;
      results[name] = {
         iterations,
         totalMs: durationMs.toFixed(3),
         avgNsPerCall: (Number(durationNs) / iterations).toFixed(2),
      };
   }

   return results;
}

// --- Pretty print ---
function printResults(results: any): any {
   console.log('--- Timer Benchmark Results ---');
   for (const [name, stats] of Object.entries(results)) {
      console.log(`${name.padEnd(20)} | total: ${stats.totalMs} ms | avg: ${stats.avgNsPerCall} ns/call`);
   }
}

// --- Run ---
const results = runBenchmark(5_000_000);
printResults(results);
