// oxlint-disable-next-line typescript/no-explicit-any
export type EventData = any;
export class EventEmitter<E extends Record<string, EventData>> {
   private target = new Map<keyof E, Array<(payload: unknown) => void>>();
   public add<K extends keyof E>(type: K, listener: (payload: E[K]) => void): void {
      let list = this.target.get(type);
      if (!list) this.target.set(type, (list = []));
      list.push(listener as (payload: unknown) => void);
   }
   public remove<K extends keyof E>(type: K, listener: (payload: E[K]) => void): void {
      const list = this.target.get(type);
      if (!list) return;
      const i = list.indexOf(listener as (payload: unknown) => void);
      if (i > 0) list.splice(i, 1);
   }
   public dispatch<K extends keyof E>(type: K, payload: E[K]): void {
      const list = this.target.get(type);
      if (!list) return;
      for (let i = 0; i < list.length; i++) {
         const func = list[i];
         func(payload);
      }
   }
}
export class PersonalEmitter<E extends Record<string, EventData>> {
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
