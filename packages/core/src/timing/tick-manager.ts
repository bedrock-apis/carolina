import { JobManager } from './job-manager';

export class TickManager {
   /** The manager that holds and dispatches scheduled jobs each tick. */
   public readonly jobManager: JobManager = new JobManager();

   /** The index of the current tick (increments each tick cycle). */
   public currentTick = 0;

   /** Timestamp (ms) when the current tick started. */
   public currentTickStartTime: number = performance.now();

   /** Target ticks per second. */
   public ticksPerSeconds = 20;

   /** Target duration per tick in milliseconds (ms). Small offset to better match timing). */
   protected millisecondsPerTick = -0.4 + 1000 / this.ticksPerSeconds;

   /** Measured elapsed time (ms) for the current tick loop. */
   protected currentTickTime = 0;

   /** Iterator over scheduled jobs provided by the JobManager. */
   protected readonly jobIterator = this.jobManager.jobIterator;

   /** Whether the ticker loop should keep running. */
   protected alive: boolean = true;

   /** Promise representing the currently running ticker task (if any). */
   protected task: Promise<void> | null = null;

   /**
    * Start the ticker loop.
    * If already running, this is a no-op.
    * Resolves when the ticker completes (i.e., after shutdown is awaited).
    */
   public async start(): Promise<void> {
      if (this.task) return;
      this.alive = true;
      return await (this.task = this.ticker());
   }

   /**
    * Request shutdown of the ticker and await the running ticker task to finish.
    */
   public async shutdown(): Promise<void> {
      this.alive = false;
      await this.task;
   }

   /**
    * Perform a single tick: update start time, run job manager, and busy-wait / yield
    * until the target tick duration has elapsed.
    */
   protected async tick(): Promise<void> {
      const start = -(this.currentTickStartTime = performance.now());
      this.jobManager.tick(this.currentTick);
      do {
         if (!this.jobIterator.next().value) {
            // We want to sink the time somewhere so we just await
            // oxlint-disable-next-line no-await-in-loop
            await new Promise(res =>
               this.millisecondsPerTick - this.currentTickTime > 15 ? setTimeout(res, 4) : setImmediate(res)
            );
         }
      } while ((this.currentTickTime = performance.now() + start) < this.millisecondsPerTick);
   }

   /**
    * Main ticker loop that advances ticks until shutdown is requested.
    */
   protected async ticker(): Promise<void> {
      while (this.alive) {
         // oxlint-disable-next-line no-await-in-loop
         await this.tick();
         this.currentTick++;
      }
   }

   /** Adjust ticks-per-second target and recalculate millisecondsPerTick. */
   protected setTicksPerSeconds(tps: number): void {
      this.ticksPerSeconds = tps;
      this.millisecondsPerTick = -0.5 + 1000 / this.ticksPerSeconds;
   }
}
