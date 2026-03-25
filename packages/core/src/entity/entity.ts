import { Vec3, Vector3 } from '@carolina/common';

import { World } from '../world';
import { Dimension } from '../world/dimension';
import { EntityType } from './entity-type';

let INTERNAL_RUNTIME_ID_INDEXER = 0;
export class Entity {
   public readonly runtimeId: number = INTERNAL_RUNTIME_ID_INDEXER++;
   public readonly entityId: number;
   public readonly type: EntityType;
   public readonly typeId: string;
   public readonly world: World;
   public readonly dimension: Dimension;
   public location: Vector3 = Vec3(0, 0, 0);
   public velocity: Vector3 = Vec3(0, 0, 0);
   public gravity: Vector3 = Vec3(0, 0, 0);
   public constructor(
      type: EntityType,
      dimension: Dimension,
      entityId: number = INTERNAL_RUNTIME_ID_INDEXER++
   ) {
      this.entityId = entityId;
      this.type = type;
      this.typeId = type.id;
      this.dimension = dimension;
      this.world = dimension.world;
   }
}
