import {
  KeyMapInterface, KeyMaps, KeysInterface, UserInterface, UserStateChange,
} from '@battletris/shared';
import { Key } from 'ts-keycode-enum';
import GameUser from './GameUser';

// const keysToIgnore = [
//   Key.Alt,
//   Key.Ctrl,
//   Key.LeftWindowKey,
//   Key.RightWindowKey,
//   Key.Shift,
// ];

const repeatKeys = [
  UserStateChange.RIGHT,
  UserStateChange.LEFT,
  UserStateChange.SOFT_DROP,
  UserStateChange.TURN_LEFT,
  UserStateChange.TURN_RIGHT,
  UserStateChange.TURN_180,
];

const dcdKeys = [
  UserStateChange.HARD_DROP,
  UserStateChange.TURN_LEFT,
  UserStateChange.TURN_RIGHT,
  UserStateChange.TURN_180,
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

  /** key repeat interval holding */
  keyArr: Record<number, number> = {};

  /** key press delay, unti arr starts */
  keyDas: Record<number, number> = {};

  /** prevent duplicated key presses */
  keyLock: Record<number, boolean> = {};

  rts: number;

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
    this.rts = activeKeyMap.rts;
    this.sdf = activeKeyMap.sdf;

    Object.keys(this.keys).forEach((stateChange: string) => {
      const stateKeys: Key[] = this.keys[stateChange];
      stateKeys.forEach((key) => {
        this.keyToStateChange[key] = stateChange;
      });
    });
  }

  listen() {
    const keyToStateChange = this.keyToStateChange;
    const keyDownListener = ($event: KeyboardEvent) => {
      const actionCode = parseInt(keyToStateChange[$event.keyCode], 10);
      // only react on known and single key presses, when command is pressed
      if (typeof keyToStateChange[$event.keyCode] !== 'undefined') {
        if (!this.keyLock[actionCode] && !this.keyDas[actionCode] && !this.keyArr[actionCode]) {
          if (repeatKeys.includes(actionCode)) {
            this.sendKey(actionCode);
            // wait for das finished and start arr afterwards
            this.keyDas[actionCode] = setTimeout(() => {
              delete this.keyDas[actionCode];
              // retrigger the key, otherwise we would wait another arr period
              this.sendKey(actionCode);
              // start arr interval
              this.keyArr[actionCode] = setInterval(
                () => this.sendKey(actionCode),
                // use different speed for soft drop, turn and arrow keys
                this.getRepeatValue(actionCode),
              );
            }, this.das);
          } else {
            this.keyLock[actionCode] = true;
            this.sendKey(actionCode);
            // if dcd is enabled, stop all arr keys for a specific amount of time and start them
            // afterwards again
            if (this.dcd && dcdKeys.includes(actionCode)) {
              Object.keys(this.keyArr).forEach((key) => {
                clearInterval(this.keyArr[key]);
                // wait for the dcd timeout and retrigger arr, if the keys are still pressed
                setTimeout(() => {
                  if (this.keyArr[key]) {
                    const parsedKey = parseInt(key, 10);
                    this.keyArr[key] = setInterval(
                      () => this.sendKey(parsedKey),
                      // use different speed for soft drop, turn and arrow keys
                      this.getRepeatValue(parsedKey),
                    );
                  }
                }, this.dcd);
              });
            }
          }
        }
      }

      $event.preventDefault();
      $event.stopPropagation();

      return false;
    };

    const keyUpListener = ($event: KeyboardEvent) => {
      const actionCode = parseInt(keyToStateChange[$event.keyCode], 10);

      if (typeof this.keyDas[actionCode] !== 'undefined') {
        clearTimeout(this.keyDas[actionCode]);
      }
      if (typeof this.keyArr[actionCode] !== 'undefined') {
        clearInterval(this.keyArr[actionCode]);
      }

      delete this.keyDas[actionCode];
      delete this.keyArr[actionCode];
      delete this.keyLock[actionCode];

      // clear pressed key stack
      $event.preventDefault();
      $event.stopPropagation();

      return false;
    };

    // bind listeners and unmount functions
    window.addEventListener('keydown', keyDownListener);
    window.addEventListener('keyup', keyUpListener);
    this.clearListenerFunctions.push(() => {
      window.removeEventListener('keydown', keyDownListener);
      window.removeEventListener('keyup', keyUpListener);
    });
  }

  getRepeatValue(actionCode: number) {
    switch (actionCode) {
      case UserStateChange.SOFT_DROP: {
        return this.sdf;
      }
      case UserStateChange.TURN_LEFT:
      case UserStateChange.TURN_RIGHT:
      case UserStateChange.TURN_180: {
        return this.rts;
      }
      case UserStateChange.LEFT:
      case UserStateChange.RIGHT: {
        return this.arr;
      }
    }
  }

  stop() {
    while (this.clearListenerFunctions.length) {
      this.clearListenerFunctions.pop()();
    }
    this.gameUser = null;
  }

  sendKey(keyCode: number) {
    this.gameUser.userKeyEvent(keyCode);
  }
}
