/* eslint-disable lines-between-class-members */
import { Key } from 'ts-keycode-enum';
import KeyMapInterface from './KeyMapInterface';
import { UserStateChange } from './stateChanges';

export default class KeyMap implements KeyMapInterface {
  static [UserStateChange.ABILITY_1] = [Key.Q];
  static [UserStateChange.ABILITY_2] = [Key.W];
  static [UserStateChange.ABILITY_3] = [Key.E];
  static [UserStateChange.ABILITY_4] = [Key.R];
  static [UserStateChange.HARD_DROP] = [Key.Space, Key.Numpad8];
  static [UserStateChange.HOLD] = [Key.Shift, Key.C, Key.Numpad0];
  static [UserStateChange.LEFT] = [Key.LeftArrow, Key.Numpad4];
  static [UserStateChange.NEXT_TARGET] = [Key.Tab];
  static [UserStateChange.RIGHT] = [Key.RightArrow, Key.Numpad6];
  static [UserStateChange.SOFT_DROP] = [Key.DownArrow, Key.Numpad2];
  static [UserStateChange.TARGET_USER_1] = [Key.One];
  static [UserStateChange.TARGET_USER_2] = [Key.Two];
  static [UserStateChange.TARGET_USER_3] = [Key.Three];
  static [UserStateChange.TARGET_USER_4] = [Key.Four];
  static [UserStateChange.TARGET_USER_5] = [Key.Five];
  static [UserStateChange.TURN_180] = [Key.A];
  static [UserStateChange.TURN_LEFT] = [Key.Ctrl, Key.Z, Key.Numpad3, Key.Numpad7];
  static [UserStateChange.TURN_RIGHT] = [Key.UpArrow, Key.X, Key.Numpad1, Key.Numpad5, Key.Numpad9];
}
