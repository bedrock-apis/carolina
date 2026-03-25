import { Float32, SerializeAs, VarUint32, VarUint64 } from '@carolina/binary';
import { Vector2, Vector3 } from '@carolina/common';

import { PacketCompilable, PacketType } from '../abstract';
import { InputData, InputMode, InteractionMode, PacketIds, PlayMode } from '../enums';
import { PlayerInputTickType, Vector2f, Vector3f } from '../types';

@PacketCompilable(PacketIds.PlayerAuthInput)
export class PlayerAuthInputPacket extends PacketType {
   @SerializeAs(Vector2f) public rotation!: Vector2;
   @SerializeAs(Vector3f) public location!: Vector3;
   @SerializeAs(Vector2f) public motion!: Vector2;
   @SerializeAs(Float32, true) public headYaw!: number;
   @SerializeAs(VarUint64) public inputFlags!: InputData;
   @SerializeAs(VarUint32) public inputMode!: InputMode;
   @SerializeAs(VarUint32) public playMode!: PlayMode;
   @SerializeAs(VarUint32) public interactionMode!: InteractionMode;
   @SerializeAs(Vector2f) public interactRotation!: Vector2f;
   @SerializeAs(PlayerInputTickType) public inputTick!: bigint;
   @SerializeAs(Vector3f) public locationDelta!: Vector3f;
   //   @SerializeAs(PlayerAuthInputTransaction, { parameter: 'inputData' })
   //   public inputTransaction!: InputTransaction | null;
   //   @SerializeAs(PlayerAuthItemStackRequest, { parameter: 'inputData' })
   //   public itemStackRequest!: PlayerAuthItemStackRequest | null;
   //   @SerializeAs(PlayerBlockActions, { parameter: 'inputData' })
   //   public blockActions!: PlayerBlockActions | null;
   //   @SerializeAs(ClientPredictedVehicle, { parameter: 'inputData' })
   //   public predictedVehicle!: ClientPredictedVehicle | null;
   /* @SerializeAs(Vector2f) public analogueMotion!: Vector2f;
   @SerializeAs(Vector3f) public cameraOrientation!: Vector3f;
   @SerializeAs(Vector2f) public rawMoveVector!: Vector2f;*/
}
