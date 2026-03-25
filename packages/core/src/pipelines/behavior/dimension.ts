import { Logger, Pipeline, rgb } from '@carolina/common';

import { Player } from '../../entity/player';
import { World } from '../../world';

export class WorldBehaviorPipeline extends Pipeline {
   public readonly world: World;
   public readonly logger: Logger;
   public constructor(world: World) {
      super();
      this.world = world;
      this.logger = new Logger(rgb(180, 136, 70)(new.target.name), this.world.carolina.logger);
   }
   public transfer(_player: Player): void {
      //player.client.pipelineStack.bound(this, player));
      // Logic like teleportation and gamerule updates
      this.logger.info('Damn info dimension');
   }
}
