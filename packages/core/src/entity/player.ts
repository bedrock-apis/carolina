import { Client } from '../network';
import { Dimension } from '../world/dimension';
import { Entity } from './entity';
import { EntityType } from './entity-type';

export class Player extends Entity {
   public readonly client: Client;
   public constructor(client: Client, dimension: Dimension) {
      super(new EntityType('minecraft:player'), dimension);
      this.client = client;
   }
}
