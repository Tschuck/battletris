import { mapHelper, GameUser } from '@battletris/shared';
import { GameStateChange } from '@battletris/shared/functions/gameHelper';
import FrontendGameUser from './GameUser';

export default class SingleGameUser extends FrontendGameUser {
  increaseLoopTimeout!: number;

  constructor(
    user: GameUser,
    gameUserIndex: number,
    gameUserCount: number,
    onUpdate: (frontendUser: FrontendGameUser, userUpdate: Partial<GameUser>) => void,
  ) {
    super(user, gameUserIndex, gameUserCount, onUpdate);
    this.start();
  }

  /**
   * Start timeout to move blocks down.
   */
  gameLoop() {
    // ensure that only one is running
    clearTimeout(this.gameLoopTimeout);
    this.gameLoopTimeout = setTimeout(() => {
      // ensure users are up to date
      this.onNewStateChange(GameStateChange.DOWN);

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

  start() {
    this.map = mapHelper.getEmptyMap(20);
    // ensure random game block
    this.setNewBlock();
    // start game loop iteration
    this.gameLoop();
    // start increase timeout
    this.increaseLoopTimeout = setInterval(() => {
      this.speed -= 50;
    }, 30_000);
  }

  /**
   * New user key pres.
   *
   * @param $event keyboard event
   */
  userKeyEvent(keyCode: number) {
    // ignore unknown key events
    if (!GameStateChange[keyCode]) {
      return;
    }
    this.onNewStateChange(keyCode);
  }

  onUserLost() {
    window.dispatchEvent(new Event('single-player-finished'));
  }
}
