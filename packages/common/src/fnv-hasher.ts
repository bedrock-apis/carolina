export class FNVHasher<T extends number | bigint> {
   public static readonly FNV_32A_OFFSET = 0x81_1c_9d_c5;
   public static readonly FNV1_64_OFFSET = 0xcbf29ce484222325n;
   protected hash: T;
   protected readonly offset: T;
   protected readonly hasher: (data: Uint8Array, offset?: T) => T;
   public constructor(offset: T, hasher: (data: Uint8Array, offset?: T) => T) {
      this.offset = offset;
      this.hash = offset;
      this.hasher = hasher;
   }

   public reset(): void {
      this.hash = this.offset;
   }

   public update(data: Uint8Array): void {
      const { hash, hasher } = this;
      this.hash = hasher(data, hash);
   }
   public digest(): T {
      return this.hash;
   }

   public static FNV_32A_HASH(data: Uint8Array, hash: number = this.FNV_32A_OFFSET): number {
      for (let i = 0; i < data.length; i++) {
         hash ^= data[i];
         hash = hash + (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
      }
      return hash | 0;
   }

   public static FNV1_64_HASH(data: Uint8Array, hash: bigint = this.FNV1_64_OFFSET): bigint {
      for (let i = 0; i < data.length; i++) {
         hash =
            (hash << 40n) + (hash << 8n) + (hash << 7n) + (hash << 5n) + (hash << 4n) + (hash << 1n) + hash;
         hash &= 0xffff_ffff_ffff_ffffn;
         hash ^= BigInt(data[i]);
      }
      return hash;
   }
}
