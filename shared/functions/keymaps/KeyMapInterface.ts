/* eslint-disable lines-between-class-members */
import { Key } from 'ts-keycode-enum';
import { UserStateChange } from './stateChanges';

export default class KeyMap {
  static [UserStateChange.ABILITY_1]: Key[];
  static [UserStateChange.ABILITY_2]: Key[];
  static [UserStateChange.ABILITY_3]: Key[];
  static [UserStateChange.ABILITY_4]: Key[];
  static [UserStateChange.HARD_DROP]: Key[];
  static [UserStateChange.HOLD]: Key[];
  static [UserStateChange.LEFT]: Key[];
  static [UserStateChange.NEXT_TARGET]: Key[];
  static [UserStateChange.RIGHT]: Key[];
  static [UserStateChange.SOFT_DROP]: Key[];
  static [UserStateChange.TARGET_USER_1]: Key[];
  static [UserStateChange.TARGET_USER_2]: Key[];
  static [UserStateChange.TARGET_USER_3]: Key[];
  static [UserStateChange.TARGET_USER_4]: Key[];
  static [UserStateChange.TARGET_USER_5]: Key[];
  static [UserStateChange.TURN_180]: Key[];
  static [UserStateChange.TURN_LEFT]: Key[];
  static [UserStateChange.TURN_RIGHT]: Key[];
}
