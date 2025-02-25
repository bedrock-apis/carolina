export abstract class Encoding<T> {
    public abstract encode(input: T): Uint8Array;
    public abstract encodeInto(input: T, destination: Uint8Array): number;
    public abstract decode(input: Uint8Array): T;
}