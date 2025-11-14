export class DeferredRunner {
   public readonly schedule: (func: () => void) => unknown;
   public readonly task: () => void;

   protected isQueued: boolean = false; // cancellation flag
   protected wasQueued: boolean = false; // tracks if a schedule was made

   public constructor(schedule: (func: () => void) => unknown, task: () => void) {
      this.schedule = schedule;
      this.task = task;
   }

   /** Queue the task for deferred execution */
   public defer(): void {
      // We allow the task to be run if already scheduled
      this.isQueued = true;

      // If wasn't scheduled then we create new schedule
      if (!this.wasQueued) {
         this.wasQueued = true;
         this.schedule(() => {
            const _ = this.isQueued;

            // Reset variables before task so we sure when the task throws we are not effected.
            this.isQueued = this.wasQueued = false;

            // Only if allowed to run
            if (_) this.task();
         });
      }
   }

   /** Run immediately, cancelling any deferred execution */
   public run(): void {
      this.isQueued = false; // cancel any pending deferred run
      this.task();
   }
}

export class MicrotaskDeferredRunner extends DeferredRunner {
   public constructor(method: () => void) {
      super(queueMicrotask, method);
   }
}
