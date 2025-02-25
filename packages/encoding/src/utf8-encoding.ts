import { Encoding } from "./encoding";

//@ts-expect-error
const utf8Encoder = new TextEncoder("utf-8");
const utf8Decoder = new TextDecoder("utf-8");

export class UTF8Encoding extends Encoding<string>{
    public encode(input: string): Uint8Array {return utf8Encoder.encode(input);}
    public encodeInto(input: string, destination: Uint8Array): number {return utf8Encoder.encodeInto(input, destination).written}
    public decode(input: Uint8Array): string { return utf8Decoder.decode(input); }
}