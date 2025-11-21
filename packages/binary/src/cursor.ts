export class Cursor<T extends ArrayBufferLike = ArrayBufferLike> {
   /**
    * Zero-Copy
    */
   public static create<T extends ArrayBufferLike = ArrayBufferLike>(buffer: Uint8Array<T>): Cursor<T> {
      return new this(buffer);
   }
   protected constructor(
      public readonly buffer: Uint8Array<T>,
      public readonly view = new DataView<T>(buffer.buffer, buffer.byteOffset, buffer.byteLength),
      public pointer: number = 0
   ) {}
   /**
    * Zero-Copy
    */
   public getEncapsulation(length: number): Cursor<T> {
      return new Cursor(this.getSliceSpan(length));
   }
   /**
    * Zero-Copy
    */
   public getSliceSpan(length: number): Uint8Array<T> {
      return this.buffer.subarray(this.pointer, this.pointer + length);
   }
   /**
    * Zero-Copy
    */
   public readSliceSpan(length: number): Uint8Array<T> {
      return this.buffer.subarray(this.pointer, (this.pointer += length));
   }
   /**
    * Zero-Copy
    */
   public getRemainingBytes(): Uint8Array<T> {
      return this.buffer.subarray(this.pointer);
   }
   /**
    * Zero-Copy
    */
   public getProcessedBytes(): Uint8Array<T> {
      return this.buffer.subarray(0, this.pointer);
   }
   public get processedBytesSize(): number {
      return this.pointer;
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
   public writeSliceSpan(value: Uint8Array): void {
      this.buffer.set(value, this.pointer);
      this.pointer += value.length;
   }
   public get isEndOfStream(): boolean {
      return this.pointer >= this.buffer.length;
   }
   public get availableSize(): number {
      return this.buffer.length - this.pointer;
   }
   public reset(): this {
      this.pointer = 0;
      return this;
   }
}

export class ResizableCursor extends Cursor<ArrayBuffer> {
   public readonly arrayBuffer: ArrayBuffer;
   public constructor(size: number, maxSize: number) {
      const arrayBuffer = new ArrayBuffer(size, { maxByteLength: maxSize });
      super(new Uint8Array(arrayBuffer), new DataView(arrayBuffer));
      this.arrayBuffer = arrayBuffer;
   }
   public grow(): void {
      this.arrayBuffer.resize(this.arrayBuffer.byteLength * 2);
   }
   public growToFit(size: number): void {
      while (this.availableSize < size) this.grow();
   }
}
