/* eslint-disable lines-between-class-members */
import { Key } from 'ts-keycode-enum';
import { UserStateChange } from './stateChanges';

export interface KeysInterface {
  [UserStateChange.ABILITY_1]: Key[];
  [UserStateChange.ABILITY_2]: Key[];
  [UserStateChange.ABILITY_3]: Key[];
  [UserStateChange.ABILITY_4]: Key[];
  [UserStateChange.HARD_DROP]: Key[];
  [UserStateChange.HOLD]: Key[];
  [UserStateChange.LEFT]: Key[];
  [UserStateChange.NEXT_TARGET]: Key[];
  [UserStateChange.RIGHT]: Key[];
  [UserStateChange.SOFT_DROP]: Key[];
  [UserStateChange.TARGET_USER_1]: Key[];
  [UserStateChange.TARGET_USER_2]: Key[];
  [UserStateChange.TARGET_USER_3]: Key[];
  [UserStateChange.TARGET_USER_4]: Key[];
  [UserStateChange.TARGET_USER_5]: Key[];
  [UserStateChange.TURN_180]: Key[];
  [UserStateChange.TURN_LEFT]: Key[];
  [UserStateChange.TURN_RIGHT]: Key[];
}

export default interface KeyMapInterface {
  // auto repeat rate / key repeat (how quickly the pieces move from right to left
  arr: number;
  // How long you have to hold down the button to before a piece starts flying to the wall
  das: number;
  // DCD (DAS Cut Delay)
  // DCD means if you press hard drop or rotate while holding a direction the delay is applied
  // before the piece starts to move again.
  dcd: number;
  id: string;
  keys: KeysInterface;
  name: string;
  // soft drop factor => how fast to move the block down
  sdf: number;
  // rotation speed
  rts: number;
}
