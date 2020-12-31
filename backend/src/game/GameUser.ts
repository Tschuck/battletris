import { GameUser, mapHelper } from '@battletris/shared';
// eslint-disable-next-line import/no-cycle
import { classList, AbilityInterface } from '@battletris/shared/functions/classes';
import { GameStateChange } from '@battletris/shared/functions/gameHelper';
import config from '../lib/config';
import game from './Game';
import numberToBlockMap from './helpers/numberToBlockMap';

class BackendGameUser extends GameUser {
  /** list of looping effects */
  effectTimeouts: NodeJS.Timeout[] = [];

  /** list of fields that should be synced with the ui */
  forceFieldUpdates: string[] = [];

  /**
   * Start timeout to move blocks down.
   */
  gameLoop() {
    // ensure that only one is running
    clearTimeout(this.gameLoopTimeout);
    this.gameLoopTimeout = setTimeout(() => {
      this.queue.push([GameStateChange.DOWN]);

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
    this.effectTimeouts.forEach((timeout) => clearTimeout(timeout));
  }

  /**
   * Something was changed! Trigger game sending update.
   */
  sendUpdate() {
    game.sendGameUserUpdates();
  }

  start() {
    this.map = mapHelper.getEmptyMap(20);
    // ensure random game block
    this.setNewBlock();
    // start game loop iteration
    this.gameLoop();
    // start increase timeout
    this.increaseLoopTimeout = setInterval(() => {
      this.speed -= config.increaseSteps;
    }, config.increaseInterval);
  }

  onUserLost() {
    this.map = numberToBlockMap('L');
    game.onUserLost(this.id);
  }

  /** Select the next target */
  onNextTarget() {
    this.target += 1;
    if (this.target > game.users.length - 1) {
      this.target = 0;
    }
  }

  /** Activate an ability. */
  onAbility(classIndex: number, abilityIndex: number) {
    const ability = classList[classIndex].abilities[abilityIndex];
    // check if enough mana is available, otherwise the key press can be ignored
    if (this.mana >= ability.mana) {
      // reduce current users mana
      this.mana -= ability.mana;
      // add the ability effect to the target user
      const targetUser = game.users[this.target];
      targetUser.effectLoop([
        classIndex, // class index
        abilityIndex, // ability index
        Date.now(), // activation time
        this.gameUserIndex, // from index
        0, // execution time
        this.block, // active block
        this.rotation, // active block rotation
      ]);
    }
  }

  /** Executes an effect for a specific class and ability. */
  effectLoop(effect: number[]) {
    const [ classIndex, abilityIndex ] = effect;
    const ability: AbilityInterface = classList[classIndex].abilities[abilityIndex];
    let timeout;

    // display the effect
    this.effects.push(effect);
    this.forceFieldUpdates = ['effects'];

    // add the effect to the user events and increase the ticks count
    const execute = () => {
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
        this.forceFieldUpdates = ['effects'];
        // find effect index by comparing classIndex, abilityIndex and started date
        const effectIndex = this.effects.findIndex(
          (eff) => eff[0] === effect[0] && eff[1] === effect[1] && eff[2] === effect[2],
        );
        if (effectIndex !== -1) {
          this.effects.splice(effectIndex, 1);
        }
        if (timeout) {
          this.effectTimeouts.splice(this.effectTimeouts.indexOf(timeout), 1);
          clearInterval(timeout);
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
}

export default BackendGameUser;
