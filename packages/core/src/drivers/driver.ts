import { PersonalEmitter, type EventData } from '@carolina/common';

export abstract class Driver<I extends Record<string, EventData>, O extends Record<string, EventData>> {
   public readonly incoming: PersonalEmitter<I> = new PersonalEmitter();
   protected readonly outgoing: PersonalEmitter<O> = new PersonalEmitter();
   public abstract dispose(): void;
   public dispatch<K extends keyof O>(type: K, payload: O[K]): void {
      this.outgoing.dispatch(type, payload);
   }
}

export * from './network';
