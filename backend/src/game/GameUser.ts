import { WsMessageType } from '@battletris/shared';
import { formatGameUser, GameUserInterface } from '@battletris/shared/functions/gameUser';
import { cloneDeep, isEqual, isObject, transform } from 'lodash';
import { Key } from 'ts-keycode-enum';
import { User } from '../db';
import wsHandler from './wsHandler';

function getDifference(newObj: any = { }, oldObj: any = { }) {
  const changes = (object: any, base: any) => {
    return transform(object, (result: any, value: any, key: any) => {
      if (!isEqual(value, base[key])) {
        // IMPORTANT: only analyse arrays that are on top level (will be only the map)
        result[key] = (isObject(value) && isObject(base[key])
          && (!Array.isArray(base[key]) || object === newObj))
          ? changes(value, base[key])
          : value;
      }
    });
  }

  return changes(newObj, oldObj);
}

class GameUser implements GameUserInterface {
  /** db user class */
  className: string;

  /** users index within the game */
  gameUserIndex: number;

  /** db user id */
  id: string;

  /** users currently displayed map */
  map: number[][];

  /** current active block */
  block: number;

  /** active block rotation */
  rotation: number;

  /** active block x position */
  x: number;

  /** active block x position */
  y: number;

  /** amount of cleared rows */
  rows: number;

  /** last user backup to check for changes */
  lastState: any;

  constructor(user: User, gameUserIndex: number) {
    // save latest state
    this.lastState = formatGameUser(this);
    // static values
    this.id = user.id;
    this.className = user.className;
    this.gameUserIndex = gameUserIndex;
    // game values
    this.rows = 0;
    this.x = 0;
    this.block = 0;
    this.y = 0;
    this.rotation = 0;
  }

  /** Serialize the game user into a json object. */
  serialize() {
    // get the new state and compare it with the previous one.
    const newState = formatGameUser(this);
    // build the delta and update the last state
    const diff = getDifference(newState, this.lastState);
    this.lastState = cloneDeep(newState);

    return diff;
  }

  /**
   * Use serialize to build a diff object and send it to the ui
   */
  sendUpdate() {
    const updateArr = [];
    updateArr[this.gameUserIndex] = this.serialize();
    wsHandler.wsBroadcast(WsMessageType.GAME_USER_UPDATE, updateArr);
  }

  /**
   *
   * @param keyCode key number
   */
  onKeyPress(key: Key) {
    switch (key) {
      case Key.UpArrow: {
        if (this.block !== 3) {
          this.rotation = this.rotation === 3 ? 0 : this.rotation + 1;
        }
        break;
      }
      case Key.LeftArrow: {
        this.x -= 1;
        break;
      }
      case Key.RightArrow: {
        this.x += 1;
        break;
      }
      case Key.DownArrow: {
        this.y += 1;
        break;
      }
    }

    this.sendUpdate();
  }
}

export default GameUser;
