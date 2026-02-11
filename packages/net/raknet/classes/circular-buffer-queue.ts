export class CircularBufferQueue<T> {
   protected readonly buffer: Array<T | undefined>;
   protected headCursor = 0;
   protected tailCursor = 0;
   protected size = 0;
   public constructor(capacity: number) {
      this.buffer = new Array(capacity);
   }
   public reverseEnqueue(item: T): boolean {
      if (this.size === this.buffer.length) return false;
      this.tailCursor = (this.buffer.length + this.tailCursor - 1) % this.buffer.length;
      this.buffer[this.tailCursor] = item;
      this.size++;
      return true;
   }
   public enqueue(item: T): boolean {
      if (this.size === this.buffer.length) return false;
      this.buffer[this.headCursor] = item;
      this.headCursor = (this.headCursor + 1) % this.buffer.length;
      this.size++;
      return true;
   }
   public dequeue(): T | null {
      if (this.size === 0) return null;
      const item = this.buffer[this.tailCursor];

      this.buffer[this.tailCursor] = undefined; // optional cleanup
      this.tailCursor = (this.tailCursor + 1) % this.buffer.length;
      this.size--;
      return item ?? null;
   }

   public peek(): T | null {
      return this.buffer[this.tailCursor] ?? null;
   }
   public isEmpty(): boolean {
      return this.size === 0;
   }
}
