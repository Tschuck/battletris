// eslint-disable class-methods-use-this
import { cloneDeep } from 'lodash';
import Blocks, { BlockMapping } from '../enums/Blocks';
// eslint-disable-next-line import/no-cycle
import {
  AbilityInterface, classList, ClassInterface, getClassIndex, classes,
} from './classes';
import {
  CollisionType,
  GameStateChange,
  getPreviewY,
  getStoneCollision,
  iterateOverMap,
} from './gameHelper';
import { generateRandomClears, getEmptyMap } from './mapHelper';

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
function getRandomNumber(min: number, max: number): number { // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const neverUpdateProps = [
  'userEvents',
  'interactionCount',
];

/** order of keys, mapped to the abilities */
const abilityKeys = [
  GameStateChange.Q,
  GameStateChange.W,
  GameStateChange.E,
  GameStateChange.R,
];

/** keys that will be pressable by the user */
const uiKeys = [
  GameStateChange.TURN,
  GameStateChange.LEFT,
  GameStateChange.RIGHT,
  GameStateChange.DOWN,
  GameStateChange.FALL_DOWN,
  GameStateChange.NEXT_TARGET,
  GameStateChange.Q,
  GameStateChange.W,
  GameStateChange.E,
  GameStateChange.R,
];

class GameUser {
  /** users left armor, until a line will be added */
  armor!: number;

  /** mana for activating abilities */
  mana!: number;

  /** list of active effects and their activation time */
  effects: number[][] = [];

  /** targeted user */
  target!: number;

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
    this.armor = user.armor || classes[this.className].maxArmor;
    this.block = 0;
    this.blockCount = 0;
    this.effects = user.effects || [];
    this.mana = 0;
    this.rotation = 0;
    this.rowCount = 0;
    this.speed = user.speed || -1;
    this.target = user.target || gameUserIndex;
    this.x = 0;
    this.y = 0;
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
  checkGameState(lastState: GameUser, change?: GameStateChange): void {
    // check max mana and armor
    const classInstance = classList[getClassIndex(this.className)];
    if (this.mana > classInstance.maxMana) {
      this.mana = classInstance.maxMana;
    }
    if (this.armor > classInstance.maxArmor) {
      this.armor = classInstance.maxArmor;
    }
    // check if armor was beneath zero. add a empty line
    if (this.armor < 0) {
      const [newRow] = generateRandomClears([[1, 1, 1, 1, 1, 1, 1, 1, 1, 1]], 1);
      this.armor = classInstance.maxArmor;
      this.map.push(newRow);
      this.map.shift();
    }

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
  applyUserState(update: Partial<GameUser>): void {
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
  fillNextBlocks(): void{
    while (this.nextBlocks.length < 10) {
      this.nextBlocks.push(getRandomNumber(1, 7));
    }
  }

  /** User stone dock collision was detected. Write it into the game map. */
  onDocked(): void {
    iterateOverMap(Blocks[this.block][this.getRotationBlockIndex()], (value, y, x) => {
      if (value) {
        this.map[this.y + y][this.x + x] = this.block;
      }
    });

    // check for resolved rows
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let clearedRows = 0;
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

    if (clearedRows !== 0) {
      const classInstance: ClassInterface = classList[getClassIndex(this.className)];
      // stack percentage of mana accordingly to the amount of cleared rows
      this.mana += (classInstance.maxMana / 100) * ((10 * clearedRows) + clearedRows * clearedRows);
      if (this.mana > classInstance.maxMana) {
        this.mana = classInstance.maxMana;
      }
      // trigger battletris base class ability for armor healing / damage
      // if the user targets his self, use healing ability 0 - 3. target will be determine within
      // on ability
      if (this.target === this.gameUserIndex) {
        this.onAbility(0, clearedRows - 1);
      } else {
        // use damage abilities
        this.onAbility(0, 3 + clearedRows);
      }
    }

    this.setNewBlock();
  }

  /**
   * Reset x, y and rotation values and set a random or given block.
   */
  setNewBlock(block?: number): void {
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
  onNewStateChange(key: GameStateChange): void {
    // only allow user keys that can be activated (prevent from accessing effect / new block logic
    // or something else)
    if (uiKeys.indexOf(key) === -1) {
      return;
    }

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
  getRotationBlockIndex(): number {
    return this.rotation % 4;
  }

  /**
   * Reacts on a key event and updates the game state. Does not send any updates, just applies the
   * state.
   *
   * @param key key number that was pressed
   * @param userEvent array of numbers [key, id, ...optionalStuff ]
   */
  handleStateChange(inputKey: GameStateChange, userEvent?: number[]): void {
    let key: GameStateChange|undefined = inputKey;
    const beforeUser = this.clone();

    // check for state change effects
    this.effects.forEach((effect: number[]) => {
      const ability = classList[effect[0]].abilities[effect[1]];
      if (ability.onStateChange) {
        key = ability.onStateChange(this, userEvent, inputKey);
      }
    });

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
        this.onNextTarget();
        break;
      }
      case GameStateChange.Q:
      case GameStateChange.W:
      case GameStateChange.E:
      case GameStateChange.R: {
        this.onAbility(getClassIndex(this.className), abilityKeys.indexOf(key));
        break;
      }
      case GameStateChange.EFFECT: {
        if (userEvent) {
          const ability: AbilityInterface = classList[userEvent[2]].abilities[userEvent[3]];
          if (ability.tick) {
            ability.tick(this, userEvent);
          }
        } else {
          throw new Error('tried to execute effect without specifying params');
        }
        break;
      }
    }

    // check the latest move states for docked states
    this.checkGameState(beforeUser, key);
  }

  /** Start timeout to move blocks down. */
  gameLoop(): void { /* PLACEHOLDER: Will be replaced by actual backend / frontend implementation */ }

  /**  Stop timeout */
  stop(): void { /* PLACEHOLDER: Will be replaced by actual backend / frontend implementation */ }

  /** Use serialize to build a diff object and send it to the ui */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  sendUpdate(key: GameStateChange, id?: number): void {
    /* PLACEHOLDER: Will be replaced by actual backend / frontend implementation */
  }

  /** Triggered, when the user lost the game */
  onUserLost(): void { /* PLACEHOLDER: Will be replaced by actual backend / frontend implementation */ }

  /** Triggered, when the user selected the next target */
  onNextTarget(): void { /* PLACEHOLDER: Will be replaced by actual backend / frontend implementation */ }

  /** Triggered, when the user activated an ability */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onAbility(classIndex: number, abilityIndex: number): void {
    /* PLACEHOLDER: Will be replaced by actual backend / frontend implementation */
  }
}

export default GameUser;
