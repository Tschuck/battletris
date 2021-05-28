// eslint-disable class-methods-use-this
import { cloneDeep } from 'lodash';
import { Key } from 'ts-keycode-enum';
import Blocks, { BlockMapping } from '../enums/Blocks';
// eslint-disable-next-line import/no-cycle
import {
  AbilityInterface, classList, getClassIndex, classes,
} from './classes';
import {
  CollisionType,
  getPreviewY,
  getRotationBlockIndex,
  getStoneCollision,
  iterateOverMap,
} from './gameHelper';
import { GameStateChange, UserStateChange } from './keymaps/stateChanges';
import { generateRandomClears, getEmptyMap, getRandomNumber } from './mapHelper';

// order to move turned blocks that get stuck out of the bounds or out of the docked mode
const turnBlockEvades = [1, -1, 2, -2, 3, -3];

const neverUpdateProps = [
  'queue',
  'interactionCount',
];

/** order of keys, mapped to the abilities */
const abilityKeys = [
  UserStateChange.ABILITY_1,
  UserStateChange.ABILITY_2,
  UserStateChange.ABILITY_3,
  UserStateChange.ABILITY_4,
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

  /** users name */
  name!: string;

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

  /** is the user out of game? */
  lost = false;

  /** amount of used blocks */
  blockCount!: number;

  /** amount of cleared rows */
  rowCount!: number;

  /** users speed (block move down) */
  speed!: number;

  /** speed adjustments from abilities */
  speedAdjust!: number;

  /** current user level */
  level!: number;

  /** maximum amount of mana, calculated by current level and initial mana of class */
  maxMana!: number;

  /** maximum amount of armor, calculated by current level and initial armor of class */
  maxArmor!: number;

  /** experience points */
  exp!: number;

  /** amount of exp to reach for the next level */
  maxExp!: number;

  /** counter of key presses of the user */
  interactionCount = 0;

  /** list of latest user events (use arrays in arrays to reduce sent payload) ([id, key, payload]) */
  queue: (number|any)[][] = [];

  /** dates until specific ability index will be blocked */
  cooldowns: number[] = [];

  /** current hold value */
  hold: number;

  /** hold will be blocked, until the next stone was set */
  holdLock: boolean;

  /** disable controls, when the game is not started (e.g. in init number loop) */
  gameIsStarted: boolean;

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
    this.name = user.name || '';
    this.className = user.className || '';
    this.gameUserIndex = gameUserIndex;
    // setup initial game values
    this.block = 0;
    this.blockCount = 0;
    this.effects = user.effects || [];
    this.exp = 0;
    this.level = 1;
    this.rotation = 0;
    this.rowCount = 0;
    this.speedAdjust = 0;
    this.target = user.target || gameUserIndex;
    this.x = 0;
    this.y = 0;
    // ensure to run this before setting up initial armor
    this.setStatsForLevel();
    this.armor = user.armor || this.maxArmor;
    this.mana = 0;
    this.fillNextBlocks();
    // catch invalid param setup
    if (this.gameUserIndex === -1 || !this.id || !this.className) {
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
  checkGameState(lastState: GameUser, change?: GameStateChange|UserStateChange): void {
    // check max mana and armor
    if (this.mana > this.maxMana) {
      this.mana = this.maxMana;
    }
    if (this.armor > this.maxArmor) {
      this.armor = this.maxArmor;
    }
    // check if armor was beneath zero. add a empty line
    if (this.armor < 0) {
      const [newRow] = generateRandomClears([[1, 1, 1, 1, 1, 1, 1, 1, 1, 1]], 1);
      this.armor = this.maxArmor;
      this.map.push(newRow);
      this.map.shift();
    }

    // check for out of range
    const actualBlock = Blocks[this.block][this.getRotationBlockIndex()];

    // detect if a collision occurred
    let collision = getStoneCollision(this.map, actualBlock, this.y, this.x);

    // check if block was turned and if we can be moved to the left / right
    if ((change === UserStateChange.TURN_LEFT || change === UserStateChange.TURN_RIGHT)
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
        && change !== UserStateChange.TURN_RIGHT
        && change !== UserStateChange.TURN_LEFT
        && change !== UserStateChange.LEFT
        && change !== UserStateChange.RIGHT) {
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

      // never overwrite queue
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
      // stack percentage of mana accordingly to the amount of cleared rows
      this.mana += Math.ceil(
        (this.maxMana / 100) * ((10 * clearedRows) + clearedRows * clearedRows),
      );
      this.exp += clearedRows * clearedRows * (4 + (10 / clearedRows));
      if (this.mana > this.maxMana) {
        this.mana = this.maxMana;
      }
      // LEVEL UP!
      if (this.exp >= this.maxExp) {
        this.onLevelUp();
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

      // trigger on row clear implementation
      this.onRowClear();
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
    // reset the hold lock
    this.holdLock = false;
    // check for match end? (ps: we can use this here, when a collision happens, game is over)
    this.checkGameState(this, GameStateChange.NEW_BLOCK);
  }

  /**
   * Add the key events to the user events array and trigger and update
   *
   * @param keyCode key number
   */
  onNewStateChange(key: GameStateChange|UserStateChange): void {
    // disable keys when lost
    if (this.lost || !this.gameIsStarted) {
      return;
    }

    // only allow user keys that can be activated (prevent from accessing effect / new block logic
    // or something else)
    if (!UserStateChange[key]) {
      return;
    }

    // save the user interaction to ensure to send the user, what was already processed by the
    // backend
    // !IMPORTANT: be careful to handle user event emptying within the backend / frontend state
    this.interactionCount += 1;
    this.queue.push([key, this.interactionCount]);
    // update the user
    this.sendUpdate(key, this.interactionCount);
  }

  /**
   * Transforms the current rotation counter into a block index
   */
  getRotationBlockIndex(): number {
    return getRotationBlockIndex(this.rotation);
  }

  /**
   * Reacts on a key event and updates the game state. Does not send any updates, just applies the
   * state.
   *
   * @param key key number that was pressed
   * @param userEvent array of numbers [key, id, ...optionalStuff ]
   */
  handleStateChange(inputKey: GameStateChange|UserStateChange, userEvent?: number[]): void {
    // disable keys when lost
    if (this.lost) {
      return;
    }

    let key: GameStateChange|UserStateChange|undefined = inputKey;
    const beforeUser = this.clone();

    // check for state change effects
    this.effects.forEach((effect: number[]) => {
      const ability = classList[effect[0]].abilities[effect[1]];
      if (ability.onStateChange) {
        key = ability.onStateChange(this, userEvent, inputKey);
      }
    });

    switch (key) {
      case UserStateChange.TURN_RIGHT: {
        this.rotation += 1;
        break;
      }
      case UserStateChange.TURN_LEFT: {
        this.rotation -= 1;
        break;
      }
      case UserStateChange.TURN_180: {
        this.rotation += 2;
        break;
      }
      case UserStateChange.LEFT: {
        this.x -= 1;
        break;
      }
      case UserStateChange.RIGHT: {
        this.x += 1;
        break;
      }
      case UserStateChange.SOFT_DROP: {
        this.y += 1;
        // reset move down timer
        clearTimeout(this.gameLoopTimeout);
        this.gameLoop();
        break;
      }
      case UserStateChange.HARD_DROP: {
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
      case UserStateChange.HOLD: {
        if (this.holdLock) {
          break;
        }

        const prefHold = this.hold;
        this.hold = this.block;
        this.setNewBlock(prefHold);
        this.holdLock = true;
        break;
      }
      case UserStateChange.NEXT_TARGET: {
        this.onNextTarget();
        break;
      }
      case UserStateChange.ABILITY_1:
      case UserStateChange.ABILITY_2:
      case UserStateChange.ABILITY_3:
      case UserStateChange.ABILITY_4: {
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
      case UserStateChange.TARGET_USER_1:
      case UserStateChange.TARGET_USER_2:
      case UserStateChange.TARGET_USER_3:
      case UserStateChange.TARGET_USER_4:
      case UserStateChange.TARGET_USER_5: {
        this.onNextTarget(key - Key.One); // map key 1 to 5 (49 - 53) to 0 to 5
        break;
      }
    }

    // check the latest move states for docked states
    this.checkGameState(beforeUser, key);
  }

  /**
   * Calculate the latest values for level specific values.
   *
   * @return  {void}    [return description]
   */
  setStatsForLevel(): void {
    const userClass = classes[this.className];
    this.maxArmor = userClass.getArmorForLevel(this.level);
    this.maxMana = userClass.getManaForLevel(this.level);
    this.maxExp = userClass.getExpForLevel(this.level);
  }

  /** Start timeout to move blocks down. */
  gameLoop(): void { /* PLACEHOLDER: Will be replaced by actual backend / frontend implementation */ }

  /**  Stop timeout */
  stop(): void { /* PLACEHOLDER: Will be replaced by actual backend / frontend implementation */ }

  /** Use serialize to build a diff object and send it to the ui */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  sendUpdate(key: GameStateChange|UserStateChange, id?: number): void {
    /* PLACEHOLDER: Will be replaced by actual backend / frontend implementation */
  }

  /** Triggered, when the user lost the game */
  onUserLost(): void { /* PLACEHOLDER: Will be replaced by actual backend / frontend implementation */ }

  /** Triggered, when the user selected the next target */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onNextTarget(index?: number): void {
    /* PLACEHOLDER: Will be replaced by actual backend / frontend implementation */
  }

  /** Triggered, when the user activated an ability */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onAbility(classIndex: number, abilityIndex: number): void {
    /* PLACEHOLDER: Will be replaced by actual backend / frontend implementation */
  }

  /** Triggered, when the user reaches a level up */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onLevelUp(): void {
    /* PLACEHOLDER: Will be replaced by actual backend / frontend implementation */
  }

  /** Triggered, when the user clears a row */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onRowClear(): void {
    /* PLACEHOLDER: Will be replaced by actual backend / frontend implementation */
  }
}

export default GameUser;
