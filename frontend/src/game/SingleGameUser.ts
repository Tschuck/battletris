import { mapHelper, GameUser, UserStateChange } from '@battletris/shared';
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
      this.onNewStateChange(UserStateChange.SOFT_DROP);

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
    if (!UserStateChange[keyCode]) {
      return;
    }
    this.onNewStateChange(keyCode);
  }

  onUserLost() {
    window.dispatchEvent(new Event('single-player-finished'));
  }
}
