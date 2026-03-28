type Func = () => void;
export type TickHandler = (tick: number) => void;
export class JobManager {
   public onError?: (error?: unknown) => void;
   protected runs: Func[] = [];
   protected readonly unorderedTickHandlers: TickHandler[] = [];
   protected readonly jobs: Set<Iterator<void>> = new Set();
   protected readonly records: Record<number, Func[]> = {};
   protected currentTick = 0;
   public readonly jobIterator = this.getJobsIterator();
   public runJob(job: Iterator<void>): void {
      this.jobs.add(job);
   }
   public runTimeout(func: Func, delay = 1): void {
      delay = Math.max(0, delay);
      (this.records[this.currentTick + delay] ??= []).push(func);
   }
   public run(func: Func): void {
      this.runs.push(func);
   }
   public subscribe(handler: TickHandler): TickHandler {
      this.unorderedTickHandlers.push(handler);
      return handler;
   }
   public unsubscribe(handler: TickHandler): TickHandler {
      const index = this.unorderedTickHandlers.indexOf(handler);
      if (index === -1) return handler;

      // Fast spawn and removal
      this.unorderedTickHandlers[index] = this.unorderedTickHandlers[this.unorderedTickHandlers.length - 1];
      this.unorderedTickHandlers.pop();
      return handler;
   }
   public tick(tick: number): void {
      this.currentTick = tick;
      for (let i = 0; i < this.unorderedTickHandlers.length; i++) {
         const handler = this.unorderedTickHandlers[i];
         try {
            handler?.(tick);
         } catch (error) {
            this.onError?.(error);
         }
      }
      const runs = this.runs;
      const currentRecords = this.records[tick];
      if (currentRecords)
         for (let i = 0; i < currentRecords.length; i++)
            try {
               runs[i]?.();
            } catch (error) {
               this.onError?.(error);
            }
      delete this.records[tick];
      this.runs = [];
      for (let i = 0; i < runs.length; i++)
         try {
            runs[i]?.();
         } catch (error) {
            this.onError?.(error);
         }
   }

   protected *getJobsIterator(): Generator<boolean> {
      while (true) {
         for (const job of this.jobs) {
            try {
               if (job.next().done) this.jobs.delete(job);
            } catch (error) {
               this.onError?.(error);
               this.jobs.delete(job);
            }
         }
         yield this.jobs.size > 0;
      }
   }
}
