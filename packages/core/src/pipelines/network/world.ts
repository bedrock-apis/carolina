import { Logger, rgb } from '@carolina/common';
import { DisconnectReason } from '@carolina/protocol';

import { Player } from '../../entity/player';
import { Client, NetworkPipeline } from '../../network';
import { World } from '../../world';

// Movement is handled on DimensionPipeline level is it slow to check for pipeline from CarolinaNetwork layer down to the dimension? Or is it better to just leave it as is
// Pipeline hierarchy stack based [CarolinaNetwork, WorldNetwork, DimensionNetwork]
export class WorldNetworkPipeline extends NetworkPipeline<Player> {
   public readonly world: World;
   public constructor(world: World) {
      super(new Logger(rgb(180, 136, 70)(new.target.name)));
      this.world = world;
   }
   public attach(client: Client): void {
      const player = this.getPlayerForClient(client);
      if (!player) return void client.disconnect(DisconnectReason.InviteSessionNotFound);

      client.pipelineStack.bound(this, player);
      // Logic like teleportation and gamerule updates
      this.logger.info('Damn info world');

      player.dimension.network.attach(player);
   }
   public detach(client: Client): void {
      client.pipelineStack.release(this);
   }
   public getPlayerForClient(client: Client): Player | null {
      return new Player(client, this.world.dimension);
   }
}
