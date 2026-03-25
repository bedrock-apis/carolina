import {
   AbstractType,
   CompilableInterface,
   Float32,
   InterfaceOf,
   SerializeAs,
   Variant,
   VarInt32,
   VarString,
   ZigZag32,
} from '@carolina/binary';

import { GameRuleKind } from '../enums';

@CompilableInterface
export class GameRuleType extends AbstractType {
   @SerializeAs(VarString)
   public name: string = '';
   @SerializeAs(Boolean)
   public editable!: boolean;
   @SerializeAs(VarInt32)
   public type!: GameRuleKind;
   @Variant('type', {
      [GameRuleKind.Bool]: Boolean,
      [GameRuleKind.Float]: Float32,
      [GameRuleKind.Int]: ZigZag32,
   })
   public value!: boolean | number | string;
}

export type GameRule = InterfaceOf<GameRuleType>;
