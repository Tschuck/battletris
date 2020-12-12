import { GameUser, WsMessageType } from '@battletris/shared';
import { GameStateChange } from '@battletris/shared/functions/gameHelper';
import config from '../lib/config';
import wsHandler from './wsHandler';
import numberToBlockMap from './helpers/numberToBlockMap';
import game from './game';

class BackendGameUser extends GameUser {
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
   * Use serialize to build a diff object and send it to the ui
   */
  sendUpdate() {
    setTimeout(() => {
      const updateArr = [];
      updateArr[this.gameUserIndex] = this.serialize();
      wsHandler.wsBroadcast(WsMessageType.GAME_USER_UPDATE, updateArr);
      // clear user events, so we wont send them twice
      this.userEvents = [];
    }, 100);
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
