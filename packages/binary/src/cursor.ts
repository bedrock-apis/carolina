export class Cursor<T extends ArrayBufferLike = ArrayBufferLike> {
   public readonly view: DataView<T>;
   public readonly length: number;
   public constructor(
      public readonly buffer: Uint8Array<T>,
      public pointer: number = 0,
   ) {
      this.view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
      this.length = buffer.length;
   }
   public getEncapsulation(length: number): Cursor<T> {
      return new Cursor(this.getSliceSpan(length));
   }
   public getSliceSpan(length: number): Uint8Array<T> {
      return this.buffer.subarray(this.pointer, this.pointer + length);
   }
   public getRemainingBytes(): Uint8Array<T> {
      return this.buffer.subarray(this.pointer);
   }
   public getProcessedBytes(): Uint8Array<T> {
      return this.buffer.subarray(0, this.pointer);
   }
   public static create(bufferSize: number): Cursor {
      return new this(new Uint8Array(bufferSize));
   }

   public readUint8(): number {
      return this.buffer[this.pointer++];
   }
   public readUint16(littleEndian?: boolean): number {
      const _ = this.view.getUint16(this.pointer, littleEndian);
      this.pointer += 2;
      return _;
   }
   public readUint32(littleEndian?: boolean): number {
      const _ = this.view.getUint32(this.pointer, littleEndian);
      this.pointer += 4;
      return _;
   }
   public readBigUint64(littleEndian?: boolean): bigint {
      const _ = this.view.getBigUint64(this.pointer, littleEndian);
      this.pointer += 8;
      return _;
   }
   public readFloat32(littleEndian?: boolean): number {
      const _ = this.view.getFloat32(this.pointer, littleEndian);
      this.pointer += 4;
      return _;
   }
   public readFloat64(littleEndian?: boolean): number {
      const _ = this.view.getFloat64(this.pointer, littleEndian);
      this.pointer += 8;
      return _;
   }

   public writeUint8(value: number): void {
      this.buffer[this.pointer++] = value;
   }
   public writeUint16(value: number, littleEndian?: boolean): void {
      this.view.setUint16(this.pointer, value, littleEndian);
      this.pointer += 2;
   }
   public writeUint32(value: number, littleEndian?: boolean): void {
      this.view.setUint32(this.pointer, value, littleEndian);
      this.pointer += 4;
   }
   public writeBigUint64(value: bigint, littleEndian?: boolean): void {
      this.view.setBigUint64(this.pointer, value, littleEndian);
      this.pointer += 8;
   }
   public writeFloat32(value: number, littleEndian?: boolean): void {
      this.view.setFloat32(this.pointer, value, littleEndian);
      this.pointer += 4;
   }
   public writeFloat64(value: number, littleEndian?: boolean): void {
      this.view.setFloat64(this.pointer, value, littleEndian);
      this.pointer += 8;
   }
}
