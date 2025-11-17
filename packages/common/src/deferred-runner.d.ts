export declare class DeferredRunner {
   readonly schedule: (func: () => void) => unknown;
   readonly task: () => void;
   protected isQueued: boolean; // cancellation flag
   protected wasQueued: boolean; // tracks if a schedule was made
   constructor(schedule: (func: () => void) => unknown, task: () => void);
   /** Queue the task for deferred execution */
   defer(): void;
   /** Run immediately, cancelling any deferred execution */
   run(): void;
}
export declare class MicrotaskDeferredRunner extends DeferredRunner {
   constructor(method: () => void);
}
