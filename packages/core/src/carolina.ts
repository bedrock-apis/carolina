import { CarolinaServer } from './network/server';

export class Carolina {
   public providerName: string = Carolina.name;
   public readonly server: CarolinaServer = new CarolinaServer(this);
   public constructor() {}
}
