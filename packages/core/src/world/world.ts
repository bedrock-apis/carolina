import type { Carolina } from '../carolina';

import { WorldBehaviorPipeline } from '../pipelines/behavior/world';
import { WorldNetworkPipeline } from '../pipelines/network/world';
import { Dimension, DimensionType } from './dimension';
import { WorldProvider } from './providers/interface';

export class World {
   public readonly behavior: WorldBehaviorPipeline;
   public readonly network: WorldNetworkPipeline;
   public readonly carolina: Carolina;
   public readonly name: string;
   public readonly provider: WorldProvider;
   public readonly dimension: Dimension = new Dimension(0, this, new DimensionType());
   public constructor(carolina: Carolina, provider: World['provider'], name: World['name']) {
      this.carolina = carolina;
      this.provider = provider;
      this.name = name;
      this.network = new WorldNetworkPipeline(this);
      this.behavior = new WorldBehaviorPipeline(this);
   }
   public toString(): string {
      return `${this.constructor?.name ?? World.name}[${JSON.stringify(this.name)}]`;
   }
}
