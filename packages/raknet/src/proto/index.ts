export * from './pong';
export * from './encapsulation';
export function* getChunkIterator<T extends ArrayBufferLike>(
   data: Uint8Array<T>,
   chunkSize: number,
): Generator<Uint8Array<T>> {
   let currentOffset = 0;
   while (currentOffset < data.length) yield data.subarray(currentOffset, (currentOffset += chunkSize));
}
