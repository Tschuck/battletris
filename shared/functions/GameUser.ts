import { cloneDeep } from 'lodash';
import Blocks, { BlockMapping } from '../enums/Blocks';
import {
  CollisionType,
  formatGameUser,
  GameStateChange,
  GameUserMapping,
  getDifference,
  getPreviewY,
  getStoneCollision,
  iterateOverMap,
} from './gameHelper';
import { getEmptyMap } from './mapHelper';

// order to move turned blocks that get stuck out of the bounds or out of the docked mode
const turnBlockEvades = [1, -1, 2, -2];

/**
 * Gets a random between to numbers
 *
 * https://stackoverflow.com/questions/4959975/generate-random-number-between-two-numbers-in-javascript
 *
 * @param min min value
 * @param max max value
 */
function getRandomNumber(min: number, max: number) { // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

interface GameUserEvent {
  key: GameStateChange;
  id: number;
}

class GameUser {
  /** db user class */
  className: string;

  /** users index within the game */
  gameUserIndex: number;

  /** db user id */
  id: string;

  /** users currently displayed map */
  map: number[][] = [];

  /** current active block */
  block: number;

  /** active block rotation */
  rotation: number;

  /** active block x position */
  x: number;

  /** active block x position */
  y: number;

  /** last user backup to check for changes */
  lastState: any;

  /** game loop timeout */
  gameLoopTimeout: any;

  /** increase speed of block down moving */
  increaseLoopTimeout: any;

  /** is the user out of game? */
  lost = false;

  /** amount of used blocks */
  blockCount: number;

  /** amount of cleared rows */
  rowCount: number;

  /** timeout, until the next block moves down */
  speed: number;

  /** counter of key presses of the user */
  interactionCount = 0;

  /** list of latest user events */
  userEvents: GameUserEvent[] = [];

  constructor(
    user: {
      id: string;
      className: string;
    },
    gameUserIndex: number,
    config: {
      userSpeed: number;
    },
  ) {
    // save latest state
    this.lastState = formatGameUser(this);
    // static values
    this.id = user.id;
    this.className = user.className;
    this.gameUserIndex = gameUserIndex;
    // game values
    this.blockCount = 0;
    this.rowCount = 0;
    this.x = 0;
    this.block = 0;
    this.y = 0;
    this.rotation = 0;
    this.speed = config.userSpeed;
  }

  /**
   * Checks for a collision of the current active block and the map. If a collision occurred, react
   * and e.g. merge block the map or revert current changes
   *
   * @param key key that was executed
   */
  checkGameState(change?: GameStateChange) {
    // check for out of range
    const actualBlock = Blocks[this.block][this.getRotationBlockIndex()];

    // detect if a collision occurred
    let collision = getStoneCollision(this.map, actualBlock, this.y, this.x);

    // check if block was turned and if we can be moved to the left / right
    if (change === GameStateChange.TURN
      && (collision === CollisionType.OUT_OF_BOUNDS_X || collision === CollisionType.DOCKED)) {
      const xOrigin = this.x;
      let evadeCounter = 0;
      // try to move blocks out of bounds / out of docked stones => will be max 2 in positive /
      // negative direction
      while (turnBlockEvades[evadeCounter]
        && (collision === CollisionType.OUT_OF_BOUNDS_X || collision === CollisionType.DOCKED)) {
        this.x = xOrigin + turnBlockEvades[evadeCounter];
        collision = getStoneCollision(this.map, actualBlock, this.y, this.x);
        evadeCounter += 1;
      }
    }

    if (collision) {
      // game ends for you here...
      if (change === GameStateChange.NEW_BLOCK) {
        this.lost = true;
        this.block = BlockMapping.EMPTY;
        this.stop();
        this.onUserLost();
        this.sendUpdate();
        return;
      }

      // use the last state of the user for revert logics
      const previousUser = formatGameUser(this.lastState);

      // revert to the last state
      Object.keys(previousUser).forEach(
        (key: string) => (this as any)[key] = cloneDeep(previousUser[key]),
      );

      // "brand" the active stone into the map
      if (collision === CollisionType.DOCKED
        && change !== GameStateChange.TURN
        && change !== GameStateChange.LEFT
        && change !== GameStateChange.RIGHT) {
        this.onDocked();
      }
    }
  }

  /** User stone dock collision was detected. Write it into the game map. */
  onDocked() {
    iterateOverMap(Blocks[this.block][this.getRotationBlockIndex()], (value, y, x) => {
      if (value) {
        this.map[this.y + y][this.x + x] = this.block;
      }
    });

    // check for resolved rows
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let clearedRows = 0; // TODO: use this for stacking mana and stuff
    for (let y = this.map.length - 1; y !== -1; y -= 1) {
      const filledCols = this.map[y].filter((col) => !!col).length;
      // row is full! clear it
      if (filledCols === 10) {
        // clear the filled row and move down the next one
        this.map.splice(y, 1);
        // add a new empty row
        this.map.unshift(getEmptyMap(1)[0]);
        // reset y, and increase row and cleared row count
        y += 1;
        this.rowCount += 1;
        clearedRows += 1;
      }
    }

    this.setNewBlock();
  }

  /**
   * Reset x, y and rotation values and set a random or given block.
   */
  setNewBlock(block?: number) {
    this.blockCount += 1;
    this.block = block === undefined ? getRandomNumber(1, 7) : block;
    this.x = 3;
    // the block map for the long block and the square, starting with an empty zero row
    this.y = this.block === BlockMapping.BAR || this.block === BlockMapping.BLOCK ? -1 : 0;
    this.rotation = 0;
    // check for match end?
    this.checkGameState(GameStateChange.NEW_BLOCK);
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
   *
   * @param keyCode key number
   */
  onKeyPress(key: GameStateChange) {
    // save the user interaction to ensure to send the user, what was already processed by the
    // backend
    // !IMPORTANT: be careful to handle user event emptying within the backend / frontend state
    this.interactionCount += 1;
    this.userEvents.push({ key, id: this.interactionCount });

    switch (key) {
      case GameStateChange.TURN: {
        if (this.block !== 4) {
          this.rotation += 1;
        }
        break;
      }
      case GameStateChange.LEFT: {
        this.x -= 1;
        break;
      }
      case GameStateChange.RIGHT: {
        this.x += 1;
        break;
      }
      case GameStateChange.DOWN: {
        this.y += 1;
        // reset move down timer
        clearTimeout(this.gameLoopTimeout);
        this.gameLoop();
        break;
      }
      case GameStateChange.FALL_DOWN: {
        this.y = getPreviewY(
          this.map,
          Blocks[this.block][this.getRotationBlockIndex()],
          this.y,
          this.x,
        );
        this.lastState[GameUserMapping.y] = this.y;
        this.y += 1;
        break;
      }
      case GameStateChange.NEXT_TARGET: {
        // next user
        break;
      }
    }

    this.checkGameState(key);
    this.sendUpdate();
  }

  /**
   * Transforms the current rotation counter into a block index
   */
  getRotationBlockIndex() {
    return this.rotation % 4;
  }

  /** Start timeout to move blocks down. */
  // eslint-disable-next-line class-methods-use-this
  gameLoop() { /* PLACEHOLDER: Will be replaced by actual backend / frontend implementation */ }

  /**  Stop timeout */
  // eslint-disable-next-line class-methods-use-this
  stop() { /* PLACEHOLDER: Will be replaced by actual backend / frontend implementation */ }

  /** Use serialize to build a diff object and send it to the ui */
  // eslint-disable-next-line class-methods-use-this
  sendUpdate() { /* PLACEHOLDER: Will be replaced by actual backend / frontend implementation */ }

  /** Triggered, when the user lost the game */
  // eslint-disable-next-line class-methods-use-this
  onUserLost() { /* PLACEHOLDER: Will be replaced by actual backend / frontend implementation */ }
}

export default GameUser;
