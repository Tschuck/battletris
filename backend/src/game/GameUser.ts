import { GameUser } from '@battletris/shared';
import config from '../lib/config';
import game from './game';
import numberToBlockMap from './helpers/numberToBlockMap';

class BackendGameUser extends GameUser {
  /**
   * Start timeout to move blocks down.
   */
  gameLoop() {
    this.gameLoopTimeout = setTimeout(() => {
      // this.y += 1;

      // this.checkGameState(GameStateChange.DOWN);

      // // ensure users are up to date
      // this.sendUpdate();

      // // ensure next tick
      // this.gameLoop();
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
   * Something was changed! Trigger game sending update.
   */
  sendUpdate() {
    game.sendGameUserUpdates();
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

  onUserLost() {
    this.map = numberToBlockMap('L');
    game.onUserLost(this.id);
  }
}

export default BackendGameUser;
