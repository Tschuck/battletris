// eslint-disable class-methods-use-this

import { cloneDeep } from 'lodash';
import Blocks, { BlockMapping } from '../enums/Blocks';
import {
  CollisionType,
  GameStateChange,
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

const neverUpdateProps = [
  'userEvents',
  'interactionCount',
];

class GameUser {
  /** db user class */
  className!: string;

  /** users index within the game */
  gameUserIndex!: number;

  /** db user id */
  id!: string;

  /** users currently displayed map */
  map: number[][] = [];

  /** current active block */
  block!: number;

  /** next active blocks */
  nextBlocks: number[] = [];

  /** active block rotation */
  rotation!: number;

  /** active block x position */
  x!: number;

  /** active block x position */
  y!: number;

  /** game loop timeout */
  gameLoopTimeout: any;

  /** increase speed of block down moving */
  increaseLoopTimeout: any;

  /** is the user out of game? */
  lost = false;

  /** amount of used blocks */
  blockCount!: number;

  /** amount of cleared rows */
  rowCount!: number;

  /** timeout, until the next block moves down */
  speed!: number;

  /** counter of key presses of the user */
  interactionCount = 0;

  /** list of latest user events (use arrays in arrays to reduce sent payload) ([id, key]) */
  userEvents: number[][] = [];

  constructor(
    user: Partial<GameUser>|GameUser,
    gameUserIndex = -1,
  ) {
    // clone it
    if (user instanceof GameUser) {
      this.applyUserState(cloneDeep({ ...user }) as GameUser);
      // update interaction count, will not be overwritte by
      this.interactionCount = user.interactionCount;
      return;
    }

    // initialize a new user
    this.id = user.id || '';
    this.className = user.className || '';
    this.gameUserIndex = gameUserIndex;
    // setup initial game values
    this.blockCount = 0;
    this.rowCount = 0;
    this.x = 0;
    this.block = 0;
    this.y = 0;
    this.rotation = 0;
    this.speed = user.speed || -1;
    this.fillNextBlocks();
    // catch invalid param setup
    if (this.speed === -1 || this.gameUserIndex === -1 || !this.id || !this.className) {
      throw new Error(`params missing in game user setup: speed: ${this.speed},`
        + ` index: ${this.gameUserIndex}, id: ${this.id}, className: ${this.className}`);
    }
  }

  /**
   * Checks for a collision of the current active block and the map. If a collision occurred, react
   * and e.g. merge block the map or revert current changes
   *
   * @param key key that was executed
   */
  checkGameState(lastState: GameUser, change?: GameStateChange) {
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
        this.sendUpdate(GameStateChange.LOST);
        return;
      }

      // revert to the last state
      this.applyUserState(lastState);

      // "brand" the active stone into the map
      if (collision === CollisionType.DOCKED
        && change !== GameStateChange.TURN
        && change !== GameStateChange.LEFT
        && change !== GameStateChange.RIGHT) {
        this.onDocked();
      }
    }
  }

  /** get a clone of the current user instance */
  clone<UserType extends GameUser>(): UserType {
    return new GameUser(this) as UserType;
  }

  /** Apply all parameters of a existing game user to this instance */
  applyUserState(update: Partial<GameUser>) {
    Object.keys(update).forEach((key: string) => {
      if (key === 'map' && update?.map) {
        for (let y = 0; y < 20; y += 1) {
          this.map[y] = update.map[y] || this.map[y];
        }
        return;
      }

      // never overwrite userEvents
      if (neverUpdateProps.indexOf(key) !== -1) {
        return;
      }

      (this as any)[key] = (update as any)[key];
    });
  }

  /** setup a list of next blocks */
  fillNextBlocks() {
    while (this.nextBlocks.length < 10) {
      this.nextBlocks.push(getRandomNumber(1, 7));
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
    // use new block from the next block stack
    this.block = block === undefined ? this.nextBlocks.shift() as number : block;
    // ensure full stack of next blocks
    this.fillNextBlocks();
    this.x = 3;
    // the block map for the long block and the square, starting with an empty zero row
    this.y = this.block === BlockMapping.BAR || this.block === BlockMapping.BLOCK ? -1 : 0;
    this.rotation = 0;
    // check for match end? (ps: we can use this here, when a collision happens, game is over)
    this.checkGameState(this, GameStateChange.NEW_BLOCK);
  }

  /**
   * Add the key events to the user events array and trigger and update
   *
   * @param keyCode key number
   */
  onNewStateChange(key: GameStateChange) {
    // save the user interaction to ensure to send the user, what was already processed by the
    // backend
    // !IMPORTANT: be careful to handle user event emptying within the backend / frontend state
    this.interactionCount += 1;
    this.userEvents.push([key, this.interactionCount]);
    // update the user
    this.sendUpdate(key, this.interactionCount);
  }

  /**
   * Transforms the current rotation counter into a block index
   */
  getRotationBlockIndex() {
    return this.rotation % 4;
  }

  /**
   * Reacts on a key event and updates the game state. Does not send any updates, just applies the
   * state.
   *
   * @param key key number that was pressed
   */
  handleStateChange(key: GameStateChange) {
    const beforeUser = this.clone();

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
        beforeUser.y = this.y;
        this.y += 1;
        break;
      }
      case GameStateChange.NEXT_TARGET: {
        // next user
        break;
      }
    }

    // check the latest move states for docked states
    this.checkGameState(beforeUser, key);
  }

  /** Start timeout to move blocks down. */
  gameLoop() { /* PLACEHOLDER: Will be replaced by actual backend / frontend implementation */ }

  /**  Stop timeout */
  stop() { /* PLACEHOLDER: Will be replaced by actual backend / frontend implementation */ }

  /** Use serialize to build a diff object and send it to the ui */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  sendUpdate(key: GameStateChange, id?: number) {
    /* PLACEHOLDER: Will be replaced by actual backend / frontend implementation */
  }

  /** Triggered, when the user lost the game */
  onUserLost() { /* PLACEHOLDER: Will be replaced by actual backend / frontend implementation */ }
}

export default GameUser;
