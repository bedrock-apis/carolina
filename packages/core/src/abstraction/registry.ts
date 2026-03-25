import { UniqueObject } from './unique';

export abstract class ObjectTypeRegistry<T extends UniqueObject> {
   protected isFinalized = false;
   protected readonly registry: Map<string, T> = new Map();
   public getAll(): IterableIterator<T> {
      return this.registry.values();
   }
   public get(id: string): T | null {
      return this.registry.get(id) ?? null;
   }
   public has(id: string): boolean {
      return this.registry.has(id);
   }
   public register(entry: T): boolean {
      if (this.isFinalized) throw new Error('Registry is finalized');
      if (this.has(entry.id)) return false;
      this.registry.set(entry.id, entry);
      return true;
   }
   public finalize(): void {
      this.isFinalized = true;
   }
}

export class RegistrableObject<T> implements UniqueObject<T> {
   public readonly id: T;
   public constructor(id: T) {
      this.id = id;
   }
   public toString(): string {
      return `<${this.constructor.name} '${this.id}'>`;
   }
}
