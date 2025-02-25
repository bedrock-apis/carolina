import { RakNet } from "@serenity-lite/raknet";
import { Buffer } from "node:buffer";
class BinaryCursor<T extends ArrayBufferLike> extends DataView<T> {
    public static utf8Decoder = new TextDecoder();
    public offset = 0;
    protected readonly u8Array;
    /**@macro */
    public get isEndOfStream(){return this.offset >= this.byteLength}
    public constructor(buffer: T, byteOffset?: number, byteLength?: number){
        super(buffer, byteOffset, byteLength);
        this.u8Array = Buffer.from(buffer, byteOffset, byteLength);
    }
    readVarInt(): number{
        let v = 0;
        let i = 0;
        do {
            const c = this.u8Array[this.offset++];
            v |= (c & 0b0111_1111) << (i * 7);
            if(!(c & 0b1000_0000)) return v;
            i++;
        }
        while(i < 5);
        return v;
    }
    readInt32(): number{
        const v = super.getInt32(this.offset);
        this.offset += 4;
        return v;
    }
    readString16(): string{
        let size = super.getUint16(this.offset);
        const str = this.u8Array.slice(this.offset+=2, this.offset+=size).toString("utf8");
        return str;
    }
    readString16EN(): string{
        let size = super.getUint16(this.offset);
        const str = BinaryCursor.utf8Decoder.decode(this.u8Array.subarray(this.offset+=2, this.offset+=size));
        return str;
    }
}

const raknet = RakNet.New();
await raknet.start();