export * from './pong';
export * from './encapsulation';
export * from './acknowledge';
export * from './connection-request';
export * from './connection-request-accepted';
export * from './open-connection-reply-one';
export * from './open-connection-reply-two';
export * from './uint24';
export function* getChunkIterator<T extends ArrayBufferLike>(
   data: Uint8Array<T>,
   chunkSize: number,
): Generator<Uint8Array<T>> {
   let currentOffset = 0;
   while (currentOffset < data.length) yield data.subarray(currentOffset, (currentOffset += chunkSize));
}
