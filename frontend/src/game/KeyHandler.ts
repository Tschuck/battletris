import GameConnection from '@/lib/Gameconnection';
import {
  KeyMapInterface, KeyMaps, KeysInterface, UserInterface, UserStateChange,
} from '@battletris/shared';
import { Key } from 'ts-keycode-enum';
import GameUser from './GameUser';

const keysToIgnore = [
  Key.Alt,
  Key.Ctrl,
  Key.LeftWindowKey,
  Key.RightWindowKey,
  Key.Shift,
];

export default class KeyHandler implements KeyMapInterface {
  arr: number;

  clearListenerFunctions: (() => void)[] = [];

  das: number;

  dcd: number;

  gameUser: GameUser;

  id: string;

  keys: KeysInterface;

  keyToStateChange: Record<number, string> = {};

  name: string;

  sdf: number;

  constructor(user: UserInterface, gameUser: GameUser) {
    let activeKeyMap = user.keyMaps.find(
      (keyMap) => keyMap.id === user.activeKeyMap,
    );
    if (!activeKeyMap) {
      if (user.activeKeyMap === 'default') {
        activeKeyMap = new KeyMaps[0]();
      }
      if (user.activeKeyMap === 'wasd') {
        activeKeyMap = new KeyMaps[1]();
      }
    }

    this.gameUser = gameUser;
    this.arr = activeKeyMap.arr;
    this.das = activeKeyMap.das;
    this.dcd = activeKeyMap.dcd;
    this.id = activeKeyMap.id;
    this.keys = activeKeyMap.keys;
    this.name = activeKeyMap.name;
    this.sdf = activeKeyMap.sdf;

    Object.keys(this.keys).forEach((stateChange: string) => {
      const stateKeys: Key[] = this.keys[stateChange];
      stateKeys.forEach((key) => {
        this.keyToStateChange[key] = stateChange;
      });
    });
  }

  listen() {
    const ignoreKeys: number[] = [];
    const keyToStateChange = this.keyToStateChange;
    const keyDownListener = ($event: KeyboardEvent) => {
      if (ignoreKeys.indexOf($event.keyCode) === -1
        && keysToIgnore.indexOf($event.keyCode) !== -1) {
        ignoreKeys.push($event.keyCode);
      }
      // only react on known and single key presses, when command is pressed
      if (typeof keyToStateChange[$event.keyCode] !== 'undefined' && ignoreKeys.length === 0) {
        $event.preventDefault();
        $event.stopPropagation();

        this.sendKey(parseInt(keyToStateChange[$event.keyCode], 10));

        return false;
      }
    };

    const keyUpListener = ($event: KeyboardEvent) => {
      // clear pressed key stack
      ignoreKeys.splice(ignoreKeys.indexOf($event.keyCode), 1);
      if (typeof keyToStateChange[$event.keyCode] !== 'undefined') {
        $event.preventDefault();
        $event.stopPropagation();

        return false;
      }
    };

    // bind listeners and unmount functions
    window.addEventListener('keydown', keyDownListener);
    window.addEventListener('keyup', keyUpListener);
    this.clearListenerFunctions.push(() => {
      window.removeEventListener('keydown', keyDownListener);
      window.removeEventListener('keyup', keyUpListener);
    });
  }

  stop() {
    while (this.clearListenerFunctions.length) {
      this.clearListenerFunctions.pop()();
    }
  }

  sendKey(keyCode: number) {
    this.gameUser.userKeyEvent(keyCode);
  }
}
