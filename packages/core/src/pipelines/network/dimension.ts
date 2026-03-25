import { Logger, rgb } from '@carolina/common';
import { MoveMode, MovePlayerPacket, PacketIds, PlayerAuthInputPacket } from '@carolina/protocol';

import { Player } from '../../entity/player';
import { CachedImmediateMessage, NetworkPipeline } from '../../network';
import { NetworkGroup } from '../../network/groups';
import { Dimension } from '../../world/dimension';

// Movement is handled on DimensionPipeline level is it slow to check for pipeline from CarolinaNetwork layer down to the dimension? Or is it better to just leave it as is
export class DimensionNetworkPipeline extends NetworkPipeline<Player> {
   public readonly dimension: Dimension;
   public readonly group: NetworkGroup;
   public constructor(dimension: Dimension) {
      super(new Logger(rgb(180, 136, 70)(new.target.name)));
      this.dimension = dimension;
      this.group = new NetworkGroup();
   }
   public override [PacketIds.PlayerAuthInput](source: Player, packet: PlayerAuthInputPacket): boolean {
      source.location = packet.location;
      source.velocity = packet.locationDelta;
      const move = new MovePlayerPacket();
      move.headYaw = packet.headYaw;
      move.mode = MoveMode.Normal;
      move.inputTick = packet.inputTick;
      move.location = packet.location;
      move.onGround = false;
      move.pitch = packet.rotation.x;
      move.yaw = packet.rotation.y;
      move.runtimeId = BigInt(source.runtimeId);
      this.group.multicastExcept(source.client, new CachedImmediateMessage(move));
      return true;
   }
   public attach(player: Player): void {
      player.client.pipelineStack.bound(this, player);
      this.group.clients.add(player.client);
   }
   public detach(player: Player): void {
      player.client.pipelineStack.release(this);
      this.group.clients.delete(player.client);
   }
}
