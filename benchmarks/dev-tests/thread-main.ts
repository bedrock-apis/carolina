const worker = new Worker('./thread-worker.ts');

const data = new Uint8Array(256);
data[1] = 2;
worker.postMessage({ message: data }, [data.buffer]);
data[1] = 4;
console.log(data.buffer.detached);
console.log(data[1]);
