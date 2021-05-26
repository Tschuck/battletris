/* eslint-disable lines-between-class-members */
import { Key } from 'ts-keycode-enum';
import KeyMapInterface from './KeyMapInterface';
import { UserStateChange } from './stateChanges';

export default class KeyMap implements KeyMapInterface {
  name = '';

  id = 'default';

  arr = 33;
  das = 167;
  dcd = 0;
  sdf = 40;
  rts = 30;

  keys = {
    [UserStateChange.ABILITY_1]: [Key.Q],
    [UserStateChange.ABILITY_2]: [Key.W],
    [UserStateChange.ABILITY_3]: [Key.E],
    [UserStateChange.ABILITY_4]: [Key.R],
    [UserStateChange.HARD_DROP]: [Key.Space, Key.Numpad8],
    [UserStateChange.HOLD]: [Key.Shift, Key.C, Key.Numpad0],
    [UserStateChange.LEFT]: [Key.LeftArrow, Key.Numpad4],
    [UserStateChange.NEXT_TARGET]: [Key.Tab],
    [UserStateChange.RIGHT]: [Key.RightArrow, Key.Numpad6],
    [UserStateChange.SOFT_DROP]: [Key.DownArrow, Key.Numpad2],
    [UserStateChange.TARGET_USER_1]: [Key.One],
    [UserStateChange.TARGET_USER_2]: [Key.Two],
    [UserStateChange.TARGET_USER_3]: [Key.Three],
    [UserStateChange.TARGET_USER_4]: [Key.Four],
    [UserStateChange.TARGET_USER_5]: [Key.Five],
    [UserStateChange.TURN_180]: [Key.A],
    [UserStateChange.TURN_LEFT]: [Key.Ctrl, Key.Z, Key.Numpad3, Key.Numpad7],
    [UserStateChange.TURN_RIGHT]: [Key.UpArrow, Key.X, Key.Numpad1, Key.Numpad5, Key.Numpad9],
  };
}
