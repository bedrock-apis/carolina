import { Client } from './client';
import { CachedImmediateMessage } from './immediate-packet';

// You can distribute packets on specific groups,
// for example all players in single worlds are one group,
// but players in different world are not in same group and don't have to be
// for example GameRule updates have to be updated only for players of that world
// Same could be applied for dimension and ticking areas
// but i am not sure if ticking areas aren't overkill
export class NetworkGroup {
   protected readonly base: NetworkGroup | null = null;
   public readonly clients: Set<Client> = new Set();
   // to all
   public broadcast(message: CachedImmediateMessage): void {
      if (this.base) return this.base.broadcast(message);
      return this.multicast(message);
   }
   // to all
   public broadcastExcept(source: Client, message: CachedImmediateMessage): void {
      if (this.base) return this.base.broadcastExcept(source, message);
      return this.multicastExcept(source, message);
   }
   public multicast(message: CachedImmediateMessage): void {
      for (const client of this.clients) client.sendMessage(message);
   }
   public multicastExcept(source: Client, message: CachedImmediateMessage): void {
      for (const client of this.clients) if (client !== source) client.sendMessage(message);
   }
}
