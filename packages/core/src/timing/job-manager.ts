type Func = () => void;
export class JobManager {
   public onError?: (error?: unknown) => void;
   protected runs: Func[] = [];
   protected readonly jobs: Set<Iterator<number>> = new Set();
   protected readonly records: Record<number, Func[]> = {};
   public runTimeout(func: Func, delay: number = 1): void {
      delay = Math.max(0, delay);
      (this.records[this.currentTick + delay] ??= []).push(func);
   }
   public run(func: Func): void {
      this.runs.push(func);
   }
   protected currentTick: number = 0;
   public tick(tick: number): void {
      this.currentTick = tick;
      const runs = this.runs;
      this.runs = [];
      for (let i = 0; i < runs.length; i++)
         try {
            runs[i]?.();
         } catch (error) {
            this.onError?.(error);
         }
      const currentRecords = this.records[tick];
      if (currentRecords)
         for (let i = 0; i < currentRecords.length; i++)
            try {
               runs[i]?.();
            } catch (error) {
               this.onError?.(error);
            }
      delete this.records[tick];
   }
   public *getJobsIterator(): Generator<boolean> {
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
