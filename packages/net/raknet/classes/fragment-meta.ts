export class FragmentMeta implements Record<number, Uint8Array> {
   [x: number]: Uint8Array;
   public length = 0;
   public byteLength = 0;
   public set(index: number, value: Uint8Array): this {
      if (this[index]) return this;
      this.length++;
      this.byteLength += value.length;
      this[index] = value;
      return this;
   }
   public build(): Uint8Array {
      const result = new Uint8Array(this.byteLength);
      for (let i = 0, offset = 0; i < this.length; offset += this[i].length, i++) result.set(this[i], offset);
      return result;
   }
}
