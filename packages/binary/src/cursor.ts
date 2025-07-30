const TEXT_DECODER = new TextDecoder("utf-8");

export class Cursor<T extends ArrayBufferLike = ArrayBufferLike> {
    public readonly view: DataView<T>;
    public readonly length: number;
    public constructor(public readonly buffer: Uint8Array<T>, public pointer: number = 0){
        this.view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
        this.length = buffer.length;
    }
    public getSliceSpan(length: number): Uint8Array<T>{return this.buffer.subarray(this.pointer, this.pointer + length);}
    public getRemainingBytes(): Uint8Array<T>{return this.buffer.subarray(this.pointer);}
    public getProcessedBytes(): Uint8Array<T>{return this.buffer.subarray(0, this.pointer);}
    public static create(bufferSize: number): Cursor{return new this(new Uint8Array(bufferSize));}
}







// Do use this implementation it might be slower for prototype chain and i don't like it in general 'ha ha'
export class BinaryStream extends DataView<ArrayBuffer | SharedArrayBuffer> {
    public static from(uint8: Uint8Array, offset: number = 0): BinaryStream { return new this(uint8.buffer, uint8.byteOffset + offset, uint8.length - offset); }
    protected cursor: number = 0;
    public setCursor(n: number): void{ this.cursor = n; }
    public getCursor(): number{ return this.cursor; }
    public readVarInt(): number{
        let v = 0;
        let i = 0;
        do {
            const c = this.getUint8(this.cursor++); //Don't call readUint8 for performance reasons
            v |= (c & 0b0111_1111) << i;
            if(!(c & 0b1000_0000)) return v;
        }
        while((i+=7) < 40);
        return v;
    }
    public readVarLong(): bigint{
        let v = 0n;
        let i = 0n;
        do {
            const c = BigInt(this.getUint8(this.cursor++)); //Don't call readUint8 for performance reasons
            v |= (c & 0b0111_1111n) << i;
            if(!(c & 0b1000_0000n)) return v;
        }
        while((i+=7n) < 40n);
        return v;
    }
    public readUint8(_?: boolean): number {return this.getUint8(this.cursor++); }
    // Int16
    public readUint16(littleEndian?: boolean): number{
        const o = this.cursor;
        this.cursor += 2;
        return this.getUint16(o, littleEndian);
    }
    public readInt16(littleEndian?: boolean): number{
        const o = this.cursor;
        this.cursor += 2;
        return this.getInt16(o, littleEndian);
    }

    // Int32
    public readUint32(littleEndian?: boolean): number{
        const o = this.cursor;
        this.cursor += 4;
        return this.getUint32(o, littleEndian);
    }
    public readInt32(littleEndian?: boolean): number{
        const o = this.cursor;
        this.cursor += 4;
        return this.getInt32(o, littleEndian);
    }
    
    // Int32
    public readUint64(littleEndian?: boolean): bigint{
        const o = this.cursor;
        this.cursor += 8;
        return this.getBigUint64(o, littleEndian);
    }
    public readInt64(littleEndian?: boolean): bigint{
        const o = this.cursor;
        this.cursor += 8;
        return this.getBigInt64(o, littleEndian);
    }

    // Float
    public readFloat32(littleEndian?: boolean): number{
        const o = this.cursor;
        this.cursor += 4;
        return this.getFloat32(o, littleEndian);
    }
    public readFloat64(littleEndian?: boolean): number{
        const o = this.cursor;
        this.cursor += 8;
        return this.getFloat64(o, littleEndian);
    }
    

    public readString16(littleEndian?: boolean): string{ return this.readString(this.readUint16(littleEndian)); }
    public readString32(littleEndian?: boolean): string{ return this.readString(this.readUint32(littleEndian)); }
    public readStringVarInt(littleEndian?: boolean): string{ return this.readString(this.readUint32(littleEndian)); }
    public readString(size: number): string{ return TEXT_DECODER.decode(this.readBytes(size)); }
    public readBytes(size: number): Uint8Array{
        let s = this.cursor; this.cursor += size;
        return new Uint8Array(this.buffer, s, size);
    }
    public getRemainingBytes(): Uint8Array{ return new Uint8Array(this.buffer, this.cursor, this.byteLength - this.cursor);}

}