// oxlint-disable-next-line typescript/no-explicit-any
export type EventData = any;
export class EventEmitter<E extends Record<string | number, EventData>> {
   private _before: Record<keyof E, Set<(payload: unknown) => void>> = Object.create(null);
   private _on: Record<keyof E, Set<(payload: unknown) => void>> = Object.create(null);
   private _after: Record<keyof E, Set<(payload: unknown) => void>> = Object.create(null);

   public before<K extends keyof E>(type: K, listener: (payload: E[K]) => void): void {
      const set = (this._before[type] ??= new Set());
      set.add(listener as (payload: unknown) => void);
   }
   public removeBefore<K extends keyof E>(type: K, listener: (payload: E[K]) => void): void {
      const set = this._before[type];
      if (!set) return;
      set.delete(listener as (payload: unknown) => void);
      if (set.size === 0) delete this._before[type];
   }
   public on<K extends keyof E>(type: K, listener: (payload: E[K]) => void): void {
      const set = (this._on[type] ??= new Set());
      set.add(listener as (payload: unknown) => void);
   }
   public remove<K extends keyof E>(type: K, listener: (payload: E[K]) => void): void {
      const set = this._on[type];
      if (!set) return;
      set.delete(listener as (payload: unknown) => void);
      if (set.size === 0) delete this._on[type];
   }
   public after<K extends keyof E>(type: K, listener: (payload: E[K]) => void): void {
      const set = (this._after[type] ??= new Set());
      set.add(listener as (payload: unknown) => void);
   }
   public removeAfter<K extends keyof E>(type: K, listener: (payload: E[K]) => void): void {
      const set = this._after[type];
      if (!set) return;
      set.delete(listener as (payload: unknown) => void);
      if (set.size === 0) delete this._after[type];
   }
   public dispatch<K extends keyof E>(type: K, payload: E[K]): void {
      const before = this._before[type];
      if (before) {
         for (const func of before) func(payload);
      }
      const on = this._on[type];
      if (on) {
         for (const func of on) func(payload);
      }
      const after = this._after[type];
      if (after) {
         for (const func of after) func(payload);
      }
   }
   public hasBefore<K extends keyof E>(type: K): boolean {
      return Boolean(this._before[type]?.size);
   }
   public has<K extends keyof E>(type: K): boolean {
      return Boolean(this._on[type]?.size);
   }
   public hasAfter<K extends keyof E>(type: K): boolean {
      return Boolean(this._after[type]?.size);
   }
   public hasAny<K extends keyof E>(type: K): boolean {
      return this.hasBefore(type) || this.has(type) || this.hasAfter(type);
   }
}
export class PersonalEmitter<E extends Record<string | number, EventData>> {
   private target: Record<keyof E, (payload: unknown) => void> = Object.create(null);
   public set<K extends keyof E>(type: K, listener: (payload: E[K]) => void): void {
      this.target[type] = listener as (payload: unknown) => void;
   }
   public delete<K extends keyof E>(type: K): boolean {
      return delete this.target[type];
   }
   public dispatch<K extends keyof E>(type: K, payload: E[K]): void {
      const callback = this.target[type];
      callback?.(payload);
   }
}
