/* eslint-disable lines-between-class-members */
import { Key } from 'ts-keycode-enum';
import KeyMapInterface from './KeyMapInterface';
import { UserStateChange } from './stateChanges';

export default class WasdMap implements KeyMapInterface {
  name = '';

  id = 'wasd';

  arr = 33;
  das = 167;
  dcd = 0;
  sdf = 40;
  rts = 30;

  keys = {
    [UserStateChange.ABILITY_1]: [Key.U],
    [UserStateChange.ABILITY_2]: [Key.I],
    [UserStateChange.ABILITY_3]: [Key.O],
    [UserStateChange.ABILITY_4]: [Key.P],
    [UserStateChange.HARD_DROP]: [Key.S, Key.Numpad5],
    [UserStateChange.HOLD]: [Key.Shift],
    [UserStateChange.LEFT]: [Key.A, Key.Numpad4],
    [UserStateChange.NEXT_TARGET]: [Key.Tab],
    [UserStateChange.RIGHT]: [Key.D, Key.Numpad6],
    [UserStateChange.SOFT_DROP]: [Key.W, Key.Numpad8],
    [UserStateChange.TARGET_USER_1]: [Key.One],
    [UserStateChange.TARGET_USER_2]: [Key.Two],
    [UserStateChange.TARGET_USER_3]: [Key.Three],
    [UserStateChange.TARGET_USER_4]: [Key.Four],
    [UserStateChange.TARGET_USER_5]: [Key.Five],
    [UserStateChange.TURN_180]: [Key.UpArrow, Key.Numpad2],
    [UserStateChange.TURN_LEFT]: [Key.LeftArrow, Key.Numpad7],
    [UserStateChange.TURN_RIGHT]: [Key.RightArrow, Key.Numpad9],
  };
}
