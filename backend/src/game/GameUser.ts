import { GameUser, mapHelper, UserStateChange } from '@battletris/shared';
// eslint-disable-next-line import/no-cycle
import { classList, AbilityInterface } from '@battletris/shared/functions/classes';
import { GameStateChange } from '@battletris/shared';
import { getRandomNumber } from '@battletris/shared/functions/mapHelper';
import config from '../lib/config';
import game from './Game';
import numberToBlockMap from './helpers/numberToBlockMap';

class BackendGameUser extends GameUser {
  /** list of looping effects */
  effectTimeouts: NodeJS.Timeout[] = [];

  /** list of cooldown timeouts */
  cooldownTimeouts: NodeJS.Timeout[] = [];

  /** list of fields that should be synced with the ui */
  forceFieldUpdates: string[] = [];

  /** setup a list of next blocks */
  fillNextBlocks(): void {
    while (this.nextBlocks.length < 10) {
      const gameBlockIndex = this.blockCount + this.nextBlocks.length;

      // fill up the game blocks, until every gap until this required next block is reached
      while (game.blocks.length < gameBlockIndex + 10) {
        game.blocks.push(getRandomNumber(1, 7));

        // enable this code for allowing a maximum of two times the same stone after another
        // const totalBlocks = game.blocks.length;
        // let newBlock = getRandomNumber(1, 7);

        // // ensure, that never 3 blocks of the same type will appear after another
        // if (totalBlocks > 2) {
        //   while (game.blocks[totalBlocks - 1] === game.blocks[totalBlocks - 2]
        //     && game.blocks[totalBlocks - 1] === newBlock) {
        //     newBlock = getRandomNumber(1, 7);
        //   }
        // }

        // game.blocks.push(newBlock);
      }

      // add the block to the next
      this.nextBlocks.push(game.blocks[gameBlockIndex]);
    }
  }

  /**
   * Start timeout to move blocks down.
   */
  gameLoop() {
    // ensure that only one is running
    clearTimeout(this.gameLoopTimeout);
    const speed = this.speed + this.speedAdjust;
    this.gameLoopTimeout = setTimeout(() => {
      this.queue.push([UserStateChange.SOFT_DROP]);

      // ensure users are up to date
      this.sendUpdate();

      // ensure next tick
      this.gameLoop();
    }, speed < config.maxSpeed ? config.maxSpeed : speed);
  }

  /**
   * Stop timeout
   */
  stop() {
    clearTimeout(this.gameLoopTimeout);
    this.effectTimeouts.forEach((timeout) => clearTimeout(timeout));
  }

  /**
   * Something was changed! Trigger game sending update.
   */
  sendUpdate() {
    game.sendGameUserUpdates();
  }

  start() {
    this.gameIsStarted = true;
    this.map = mapHelper.getEmptyMap(20);
    // ensure random game block
    this.setNewBlock();
    // start game loop iteration
    this.gameLoop();
  }

  onUserLost() {
    this.map = numberToBlockMap('L');
    game.onUserLost(this.id);
  }

  /** Select the next target */
  onNextTarget(index?: number) {
    // if a specific index was selected, check if available and use it
    if (typeof index !== 'undefined') {
      if (game.users[index] && !game.users[index].lost) {
        this.target = index;
      }

      return;
    }

    // search for the next available target
    do {
      this.target += 1;
      if (this.target > game.users.length - 1) {
        this.target = 0;
      }
    } while (game.users[this.target].lost);
  }

  /** Activate an ability. */
  onAbility(classIndex: number, abilityIndex: number) {
    const ability = classList[classIndex].abilities[abilityIndex];
    // check if enough mana is available, otherwise the key press can be ignored
    // check if a cooldown for this ability is active, if yes, we can ignore it
    if ((this.mana >= ability.mana && typeof this.cooldowns[abilityIndex] === 'undefined')
      || config.devMode) {
      // reduce current users mana
      this.mana -= Math.ceil(ability.mana);
      // add the ability effect to the target user
      const targetUser = game.users[this.target];
      const effect = [
        classIndex, // class index
        abilityIndex, // ability index
        Date.now(), // activation time
        this.gameUserIndex, // from index
        0, // execution time
        1, // effect stack
      ];

      // run on activate functions (single time hooks) => solves the problem, that effects were at
      //  executed without any reference on the targets side. we can just run the game state
      // checking in here
      if (ability.onActivate) {
        // !IMPORATANT: copy the target and check the game state!
        const beforeTarget = this.clone();
        ability.onActivate(this, targetUser, effect);
        this.checkGameState(beforeTarget);
      }

      // check for already running effect
      const activeEffect = targetUser.effects.find((e) => e[0] === classIndex
        && e[1] === abilityIndex);
      // if a effect of the same type is already running, increase the runtime
      if (activeEffect) {
        // reduce the ticks and execute again
        activeEffect[5] += 1;
        this.forceFieldUpdates = ['effects'];
      } else {
        // start effect loop to run the tick function
        targetUser.effectLoop(effect, this);
      }

      // activate a ability cooldown and setup cleanup timeout
      if (ability.cooldown) {
        this.cooldowns[abilityIndex] = Date.now() + ability.cooldown;
        this.cooldownTimeouts[abilityIndex] = setTimeout(() => {
          this.forceFieldUpdates.push('cooldowns');
          delete this.cooldowns[abilityIndex];
        }, ability.cooldown);
      }
    }
  }

  /** Executes an effect for a specific class and ability. */
  effectLoop(inputEffect: number[], executor: GameUser) {
    let [ classIndex, abilityIndex, startDate ] = inputEffect;
    const ability: AbilityInterface = classList[classIndex].abilities[abilityIndex];
    let timeout;

    // display the effect
    this.effects.push(inputEffect);
    this.forceFieldUpdates = ['effects'];

    // add the effect to the user events and increase the ticks count
    const execute = () => {
      // find effect index by comparing classIndex, abilityIndex and started date
      const effectIndex = this.effects.findIndex(
        (eff) => eff[0] === classIndex && eff[1] === abilityIndex && eff[2] === startDate,
      );
      const effect = this.effects[effectIndex];

      // add a effect execution to the user event queue
      this.queue.push([
        GameStateChange.EFFECT,
        null,
        classIndex,
        abilityIndex,
        effect[4] + 1,
        ...effect.slice(5, effect.length),
      ]);

      // can be removed, when ticks are reached
      effect[4] += 1;
      if (!ability.ticks || effect[4] >= ability.ticks) {
        // force effect update if we remove the effect at this position, the diff logic
        // will not update the ui
        this.forceFieldUpdates.push('effects');

        // reduce the event stack, if the event stack is not zero, start the loop again
        effect[5] -= 1;
        if (effect[5] !== 0) {
          // reset start date (to have the correct timer in the ui) and tick count
          // (to keep it running)
          effect[2] = startDate = Date.now();
          effect[4] = 0;
          return;
        }

        // if the stack is zero, cleanup
        if (effectIndex !== -1) {
          this.effects.splice(effectIndex, 1);
        }
        if (timeout) {
          this.effectTimeouts.splice(this.effectTimeouts.indexOf(timeout), 1);
          clearInterval(timeout);
        }
        if (ability.onBeforeEnd) {
          ability.onBeforeEnd(this, executor, effect);
        }
      }

      this.sendUpdate();
    };

    // start execution loop, if ticks are configured
    if (ability.ticks) {
      timeout = setInterval(execute, ability.tickTimeout);
      this.effectTimeouts.push(timeout);
    }

    // execute the effect initially
    execute();
  }

  /**
   * User reaches a level up. Reset exp, increase the level and debuff all others
   */
  onLevelUp(): void {
    this.forceFieldUpdates.push('exp');

    // never go over max level
    if (this.level === config.maxLevel) {
      this.exp = this.maxExp;
      return;
    }

    // set new stat values
    this.exp = this.exp - this.maxExp;
    this.level += 1;
    this.setStatsForLevel();
    this.forceFieldUpdates = this.forceFieldUpdates.concat([
      'level',
      'maxArmor',
      'maxMana',
      'maxExp',
    ]);

    // apply a buff to your self / debuff to the others
    // the strength is based on your level
    const buffStrength = Math.ceil(this.level / (config.maxLevel / (config.maxLevel / 4)));
    game.users.forEach((user) => {
      // add a buff for yourself
      if (user.id === this.id) {
        this.onAbility(0, buffStrength);
      } else {
        // add a debuff for the others
        this.onAbility(0, 3 + buffStrength);
      }
    });
  }

  /**
   * Trigger speed calculation.
   */
  onRowClear() {
    game.onRowClear();
  }
}

export default BackendGameUser;
