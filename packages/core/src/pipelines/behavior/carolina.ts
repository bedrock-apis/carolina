import { Logger, Pipeline, rgb } from '@carolina/common';
import { WorldExperimentType } from '@carolina/protocol';

import type { Carolina } from '../../carolina';

import { Client } from '../../network/client';
import { World } from '../../world';

export class CarolinaBehaviorPipeline extends Pipeline {
   public readonly carolina: Carolina;
   public readonly logger: Logger;
   public constructor(carolina: Carolina) {
      super();
      this.carolina = carolina;
      this.logger = new Logger(rgb(70, 158, 180)(new.target.name), this.carolina.logger);
   }
   public getInitialSpawnWorld(_client: Client): World | null {
      return this.carolina.worldManager.worlds.values().next().value ?? null;
   }
   public getActiveExperiments(_client: Client): WorldExperimentType[] {
      return [{ enabled: true, name: 'data_driven_vanilla_blocks_and_items' }];
   }
}
