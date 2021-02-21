/* eslint-disable lines-between-class-members */
import { Key } from 'ts-keycode-enum';
import KeyMap from './KeyMap';
import KeyMapInterface from './KeyMapInterface';
import { UserStateChange } from './stateChanges';

export default class WasdMap extends KeyMap implements KeyMapInterface {
  static [UserStateChange.ABILITY_1] = [Key.U];
  static [UserStateChange.ABILITY_2] = [Key.I];
  static [UserStateChange.ABILITY_3] = [Key.O];
  static [UserStateChange.ABILITY_4] = [Key.P];
  static [UserStateChange.HARD_DROP] = [Key.S, Key.Numpad5];
  static [UserStateChange.HOLD] = [Key.Shift];
  static [UserStateChange.LEFT] = [Key.A, Key.Numpad4];
  static [UserStateChange.NEXT_TARGET] = [Key.Tab];
  static [UserStateChange.RIGHT] = [Key.D, Key.Numpad6];
  static [UserStateChange.SOFT_DROP] = [Key.W, Key.Numpad8];
  static [UserStateChange.TARGET_USER_1] = [Key.One];
  static [UserStateChange.TARGET_USER_2] = [Key.Two];
  static [UserStateChange.TARGET_USER_3] = [Key.Three];
  static [UserStateChange.TARGET_USER_4] = [Key.Four];
  static [UserStateChange.TARGET_USER_5] = [Key.Five];
  static [UserStateChange.TURN_180] = [Key.UpArrow, Key.Numpad2];
  static [UserStateChange.TURN_LEFT] = [Key.LeftArrow, Key.Numpad7];
  static [UserStateChange.TURN_RIGHT] = [Key.RightArrow, Key.Numpad9];
}
