// deno run --allow-read benchmark.ts
// Basic benchmark for decodeVarInt vs decodeVarInt2

function decodeVarInt(buffer) {
   for (let i = 0, shift = 0, num = 0; i < 5; i++, shift += 7) {
      const byte = buffer[i];
      num |= (byte & 0x7f) << shift;
      if ((byte & 0x80) === 0) return num;
   }
}

function decodeVarInt2(buffer) {
   let result = 0;
   let shift = 0;

   for (let i = 0; i < buffer.length; i++) {
      const byte = buffer[i];
      result |= (byte & 0x7f) << shift;

      if ((byte & 0x80) === 0) {
         return ((result >>> 1) ^ -(result & 1)) | 0;
      }

      shift += 7;
   }
}

const samples = [
   new Uint8Array([0xac, 0x02]),
   new Uint8Array([0x81, 0x80, 0x01]),
   new Uint8Array([0xff, 0xff, 0xff, 0x01]),
];

function bench(label, fn) {
   const start = performance.now();
   for (let i = 0; i < 10_000_000; i++) fn(samples[i % samples.length]);
   const end = performance.now();
   console.log(
      label,
      (end - start).toFixed(2),
      'ms ->',
      ((end - start) * 1_000_000) / 10_000_000,
      'ns per call'
   );
}

bench('decodeVarInt', decodeVarInt);
bench('decodeVarInt2', decodeVarInt2);
