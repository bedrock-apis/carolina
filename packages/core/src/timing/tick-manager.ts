import { JobManager } from './job-manager';

export class TickManager {
   public readonly jobManager: JobManager = new JobManager();
   /**@readonly */
   public currentTick: number = 0;
   public currentTickStartTime: number = performance.now();
   public ticksPerSeconds: number = 20;
   protected millisecondsPerTick = 1000 / this.ticksPerSeconds;
   protected currentTickTime = 0;
   protected readonly jobIterator = this.jobManager.getJobsIterator();
   public async start(): Promise<void> {
      while (true) {
         // oxlint-disable-next-line no-await-in-loop
         await this.tick();
         this.currentTick++;
      }
   }
   protected async tick(): Promise<void> {
      const start = (this.currentTickStartTime = performance.now());
      this.jobManager.tick(this.currentTick);
      // oxlint-disable-next-line no-await-in-loop
      this.jobIterator.next();
      while ((this.currentTickTime = performance.now() - start) < this.millisecondsPerTick - 1) {
         if (!this.jobIterator.next().value) await new Promise(res => setImmediate(res));
      }
   }
   protected setTicksPerSeconds(tps: number): void {
      this.ticksPerSeconds = tps;
      this.millisecondsPerTick = 1000 / this.ticksPerSeconds;
   }
}
