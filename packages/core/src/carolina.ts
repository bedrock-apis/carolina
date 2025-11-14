import { NetworkServer } from './network/server';

export class Carolina {
   public providerName: string = Carolina.name;
   public readonly server: NetworkServer = new NetworkServer(this);
   public constructor() {}
}
