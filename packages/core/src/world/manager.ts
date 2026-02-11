import type { Carolina } from '../carolina';

import { World } from './world';

export class WorldsManager {
   public constructor(carolina: Carolina) {
      this.carolina = carolina;
   }
   public readonly carolina: Carolina;
   public readonly worlds: Map<string, World> = new Map();
}
