import { BlockMapping, Blocks, WsMessageType } from '@battletris/shared';
import { CollisionType, formatGameUser, GameStateChange, GameUserInterface, GameUserMapping, getDifference, getPreviewY, getStoneCollision, iterateOverMap } from '@battletris/shared/functions/gameHelper';
import { cloneDeep } from 'lodash';
import { User } from '../db';
import config from '../lib/config';
import game from './game';
import { getEmptyMap } from './helpers/mapHelper';
import numberToBlockMap from './helpers/numberToBlockMap';
import wsHandler from './wsHandler';

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

  /** last user backup to check for changes */
  lastState: any;

  /** game loop timeout */
  gameLoopTimeout: NodeJS.Timeout;

  /** increase speed of block down moving */
  increaseLoopTimeout: NodeJS.Timeout;

  /** is the user out of game? */
  lost: boolean;

  /** amount of used blocks */
  blockCount: number;

  /** amount of cleared rows */
  rowCount: number;

  /** timeout, until the next block moves down */
  speed: number;

  constructor(user: User, gameUserIndex: number) {
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
    const collision = getStoneCollision(this.map, actualBlock, this.y, this.x);
    if (collision) {
      // game ends for you here...
      if (change === GameStateChange.NEW_BLOCK) {
        this.map = numberToBlockMap('L');
        this.lost = true;
        this.block = BlockMapping.EMPTY;
        this.stop();
        game.onUserLost(this.id);
        this.sendUpdate();
        return;
      }

      // use the last state of the user for revert logics
      const previousUser = formatGameUser(this.lastState);

      // revert to the last state
      Object.keys(previousUser).forEach(
        (change) => this[change] = cloneDeep(previousUser[change]),
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
   * Start timeout to move blocks down.
   */
  gameLoop() {
    this.gameLoopTimeout = setTimeout(() => {
      this.y += 1;

      this.checkGameState(GameStateChange.DOWN);

      // ensure users are up to date
      this.sendUpdate();

      // ensure next tick
      this.gameLoop();
    }, this.speed);
  }

  /**
   * Stop timeout
   */
  stop() {
    clearTimeout(this.increaseLoopTimeout);
    clearTimeout(this.gameLoopTimeout);
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
   * Use serialize to build a diff object and send it to the ui
   */
  sendUpdate() {
    const updateArr = [];
    updateArr[this.gameUserIndex] = this.serialize();
    wsHandler.wsBroadcast(WsMessageType.GAME_USER_UPDATE, updateArr);
  }

  start() {
    // ensure random game block
    this.setNewBlock();
    // start game loop iteration
    this.gameLoop();
    // start increase timeout
    this.increaseLoopTimeout = setInterval(() => {
      this.speed -= config.increaseSteps;
    }, config.increaseInterval);
  }

  /**
   *
   * @param keyCode key number
   */
  onKeyPress(key: GameStateChange) {
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
}

export default GameUser;
