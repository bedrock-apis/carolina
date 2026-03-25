import { Float32, Int32, SerializeAs, Uint8, Conditional } from '@carolina/binary';
import { Vec3, Vector3 } from '@carolina/common';

import { PacketCompilable, PacketType } from '../abstract';
import { MoveMode, PacketIds } from '../enums';
import { EntityRuntimeIdType, PlayerInputTickType, Vector3f } from '../types';

@PacketCompilable(PacketIds.MovePlayer)
export class MovePlayerPacket extends PacketType {
   @SerializeAs(EntityRuntimeIdType) public runtimeId: bigint = 0n;
   @SerializeAs(Vector3f) public location: Vector3 = Vec3(0, 0, 0);
   @SerializeAs(Float32, true) public pitch: number = 0;
   @SerializeAs(Float32, true) public yaw: number = 0;
   @SerializeAs(Float32, true) public headYaw: number = 0;
   @SerializeAs(Uint8) public mode: MoveMode = 0;
   @SerializeAs(Boolean) public onGround: boolean = false;
   @SerializeAs(EntityRuntimeIdType) public riddenRuntimeId: bigint = 0n;

   // This can be inlined to single serialization function so its actually faster than external type
   @Conditional('mode', `$==${MoveMode.Teleport}`)
   @SerializeAs(Int32, true)
   public cause?: number;

   @Conditional('mode', `$==${MoveMode.Teleport}`)
   @SerializeAs(Int32, true)
   public sourceEntityType?: number;

   @SerializeAs(PlayerInputTickType) public inputTick: bigint = 0n;
}
