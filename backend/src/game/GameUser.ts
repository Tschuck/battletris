import { BlockMapping, Blocks, WsMessageType } from '@battletris/shared';
import { formatGameUser, GameUserInterface, GameUserMapping } from '@battletris/shared/functions/gameUser';
import { cloneDeep } from 'lodash';
import { setTimeout } from 'timers';
import { Key } from 'ts-keycode-enum';
import { User } from '../db';
import config from '../lib/config';
import wsHandler from './wsHandler';

/**
 * Iterate over a map of blocks
 * @param itMap map to iterated (game map / block map)
 * @param callback function that should be called
 */
const iterateOverMap = (
  itMap: number[][],
  callback: (value: number, y: number, x: number) => any,
): any => {
  for (let y = itMap.length - 1; y !== -1; y -= 1) {
    for (let x = itMap[y].length - 1; x !== -1; x -= 1) {
      // early exit
      const value = callback(itMap[y][x], y, x);
      if (value) {
        return value;
      }
    }
  }
}

/**
 * Return a nested property from an object.
 * @param obj obj to get nested value from
 * @param path path to select
 */
const getNestedVal = (obj: any, ...selector: any[]) => {
  let returnVal = obj;
  for (let i = 0; i < selector.length; i += 1) {
    if (typeof obj[selector[i]] === 'undefined') {
      return null;
    }

    returnVal = obj[selector[i]];
  }

  return returnVal;
};

function getDifference(newObj: any = { }, oldObj: any = { }) {
  const diff: Partial<GameUser> = {};

  Object.keys(newObj).forEach((key) => {
    // check map changes separately
    if (key === `${GameUserMapping.map}`) {
      // check for map changes
      for (let y = 0; y !== newObj[key].length - 1; y += 1) {
        for (let x = 0; x !== newObj[key][y].length - 1; x += 1) {
          // update always the full row, otherwise we get problems in ui merging logic
          if (getNestedVal(newObj, key, y, x) !== getNestedVal(oldObj, key, y, x)) {
            diff[key] = diff[key] || [];
            diff[key][y] = newObj[key][y];
            break;
          }
        }
      }
      return;
    }

    // build the diff
    if (oldObj[key] !== newObj[key]) {
      diff[key] = newObj[key];
    }
  });

  return diff;
}

enum CollisionType {
  DOCKED = 1,
  INVALID = 2,
}

/**
 * Gets a random between to numbers
 *
 * https://stackoverflow.com/questions/4959975/generate-random-number-between-two-numbers-in-javascript
 *
 * @param min min value
 * @param max max value
 */
function getRandomNumber(min, max) { // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
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

  /** game loop timeout */
  gameLoopTimeout: NodeJS.Timeout;

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

  /**
   * Checks for a collision of the current active block and the map. If a collision occurred, react
   * and e.g. merge block the map or revert current changes
   *
   * @param key key that was executed
   */
  detectCollision(key?: Key) {
    // check for out of range
    const actualBlock = Blocks[this.block][this.rotation];

    // detect if a collision occured
    const collision = iterateOverMap(actualBlock, (value, y, x) => {
      const xOnMap = this.x + x;
      const yOnMap = this.y + y;

      // out of bounds on the left or on the right
      if ((xOnMap < 0 || xOnMap > 20) && value) {
        return CollisionType.INVALID;
      }

      // out of bounds at the bottom
      if (yOnMap > 20 && value) {
        return CollisionType.INVALID;
      }

      // detect only initial dock at the bottom
      if (yOnMap === 20 && value) {
        return CollisionType.DOCKED;
      }

      // block overlaps!
      if (this.map[yOnMap] && this.map[yOnMap][xOnMap] && value) {
        return CollisionType.DOCKED;
      }
    });

    if (collision) {
      // use the last state of the user for revert logics
      const previousUser = formatGameUser(this.lastState);

      // revert to the last state
      Object.keys(previousUser).forEach((key) => this[key] = previousUser[key]);

      // "brand" the active stone into the map
      if (collision === CollisionType.DOCKED && key !== Key.UpArrow) {
        iterateOverMap(actualBlock, (value, y, x) => {
          if (value) {
            this.map[this.y + y][this.x + x] = this.block;
          }
        });

        this.setNewBlock();
      }
    }
  }

  /**
   * Start timeout to move blocks down.
   */
  gameLoop() {
    this.gameLoopTimeout = setTimeout(() => {
      this.y += 1;

      this.detectCollision(Key.DownArrow);

      // ensure users are up to date
      this.sendUpdate();

      // ensure next tick
      this.gameLoop();
    }, config.gameLoopSpeed);
  }

  /**
   * Stop timeout
   */
  gameLoopStop() {
    clearInterval(this.gameLoopTimeout);
  }

  /**
   * Reset x, y and rotation values and set a random or given block.
   */
  setNewBlock(block?: number) {
    this.block = block === undefined ? getRandomNumber(1, 7) : block;
    this.x = 3;
    // the block map for the long block and the square, starting with an empty zero row
    this.y = this.block === BlockMapping.BAR || this.block === BlockMapping.BLOCK ? -1 : 0;
    this.rotation = 0;
    // check for match end?
    this.detectCollision();
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
        if (this.block !== 4) {
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
      case Key.Tab: {
        // next user
        break;
      }
    }

    this.detectCollision(key);
    this.sendUpdate();
  }
}

export default GameUser;
