import { Classes, GameUser, mapHelper } from '@battletris/shared';
// eslint-disable-next-line import/no-cycle
import { classes, AbilityInterface } from '@battletris/shared/functions/classes';
import { GameStateChange } from '@battletris/shared/functions/gameHelper';
import { exec } from 'child_process';
import config from '../lib/config';
import game from './game';
import numberToBlockMap from './helpers/numberToBlockMap';

const abilityKeys = [
  GameStateChange.Q,
  GameStateChange.W,
  GameStateChange.E,
  GameStateChange.R,
];

class BackendGameUser extends GameUser {
  effectTimeouts: NodeJS.Timeout[] = [];

  /**
   * Start timeout to move blocks down.
   */
  gameLoop() {
    // ensure that only one is running
    clearTimeout(this.gameLoopTimeout);
    this.gameLoopTimeout = setTimeout(() => {
      this.userEvents.push([GameStateChange.DOWN]);

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
    if (this.target > game.users.length) {
      this.target = 0;
    }
  }

  /** Activate an ability. */
  onAbility(key: GameStateChange) {
    const classIndex = Classes[this.className];
    const ability = classes[classIndex].abilities[key];
    // check if enough mana is available, otherwise the key press can be ignored
    if (this.mana >= ability.mana) {
      // reduce current users mana
      this.mana -= ability.mana;
      // add the ability effect to the target user
      const targetUser = game.users[this.target];
      const effect = [
        classIndex, // class index
        key, // activated key
        Date.now(), // activation time
        0, // execution time
      ];
      targetUser.effects.push(effect);
      targetUser.effectLoop(effect);
    }
  }

  /** Executes an effect for a specific class and ability. */
  effectLoop(effect: number[]) {
    const effectIndex = this.effects.indexOf(effect);
    const [ classIndex, key, activationTime, executes ] = effect;
    const abilityKey = GameStateChange[key].toLowerCase();
    const ability: AbilityInterface = classes[classIndex].abilities[abilityKey];
    let timeout;

    const execute = () => {
      // increase execution amount
      effect[3] += 1;

      // can be removed
      if (executes > ability.ticks) {
        this.effects.splice(effectIndex, 1);
        if (timeout) {
          clearInterval(this.effectTimeouts[effectIndex]);
        }
      }
    };

    // start execution loop, if ticks are configured
    if (ability.ticks) {
      this.effectTimeouts[effectIndex] = timeout = setInterval(execute, ability.tickTimeout);
    }

    // execute the effect initially
    execute();
  }
}

export default BackendGameUser;
