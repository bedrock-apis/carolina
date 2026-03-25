import { DimensionKind } from '@carolina/protocol';

import type { World } from './world';

import { DimensionNetworkPipeline } from '../pipelines/network/dimension';

export class Dimension {
   public readonly network: DimensionNetworkPipeline = new DimensionNetworkPipeline(this);
   public readonly uniqueId: number;
   public readonly world: World;
   public readonly type: DimensionType;
   public constructor(uniqueId: number, world: World, type: DimensionType) {
      this.uniqueId = uniqueId;
      this.world = world;
      this.type = type;
   }
}

export class DimensionType {
   public readonly kind: DimensionKind = DimensionKind.Overworld;
   public readonly id: string = 'carolina:overworld';
   public getGenerator(): unknown {
      return null;
   }
}
