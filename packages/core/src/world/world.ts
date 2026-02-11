import { WorldProvider } from './providers/interface';

export class World {
   public readonly name: string;
   public readonly provider: WorldProvider;
   public constructor(provider: World['provider'], name: World['name']) {
      this.provider = provider;
      this.name = name;
   }
   public toString(): string {
      return `${this.constructor?.name ?? World.name}[${JSON.stringify(this.name)}]`;
   }
}
