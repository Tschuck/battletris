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
  id: string;
  keys: KeysInterface;
  name: string;
}
