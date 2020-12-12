import GameConnection, { getCurrentConnection } from '@/lib/GameConnection';
import { gameHelper, GameUser, WsMessageType } from '@battletris/shared';
import currUser from '../../lib/User';

const isSet = (value: number|undefined) => value !== undefined;
const updatedOrPrevious = (value: number|undefined, previous: number) => (value !== undefined
  ? value : previous);

export default class FrontendGameUser extends GameUser {
  connection: GameConnection;

  /** is the current logged in user playing? */
  isCurrUser: boolean;

  /** used unbind to watch for new game message events */
  onMessageListener: Function;

  /** list of feedbacks from the server */
  latencies: number[] = [];

  /** average of latencies */
  latency = 0;

  /** last user pressed key timestamps */
  lastKeyPressTime: number[] = [];

  /** next time, when the user block will move down */
  nextBlockMove!: number;

  constructor(
    user: {
      id: string;
      className: string;
    },
    gameUserIndex: number,
    config: {
      userSpeed: number;
    },
  ) {
    super(user, gameUserIndex, config);

    this.connection = getCurrentConnection() as GameConnection;
    this.isCurrUser = currUser.id === user.id;

    this.onMessageListener = this.connection.onMessage((type: WsMessageType, data: any) => {
      if (type === WsMessageType.GAME_USER_UPDATE && data[this.gameUserIndex]) {
        this.onUserUpdate(gameHelper.formatGameUser(data[this.gameUserIndex]));
      }
    });

    if (this.isCurrUser) {
      window.addEventListener('keydown', this.userKeyEvent);
    }
  }

  /**
   * Handle user update
   *
   * @param data incoming user update
   */
  onUserUpdate(updatedUser: Partial<GameUser>) {
    // detect latency of input
    const lastKeyPress = this.lastKeyPressTime.shift();
    if (lastKeyPress && this.isCurrUser) {
      this.latencies.unshift(Date.now() - lastKeyPress);
      if (this.latencies.length > 10) {
        this.latencies.pop();
      }
      this.latency = Math.round(
        this.latencies.reduce((a, b) => (a + b)) / this.latencies.length,
      );
    }

    // update stats
    if (updatedUser.rowCount) {
      this.rowCount = updatedUser.rowCount;
    }
    if (updatedUser.blockCount) {
      this.blockCount = updatedUser.blockCount;
    }
    if (updatedUser.speed) {
      this.speed = updatedUser.speed;
    }

    // map updates
    const {
      block,
      map,
      rotation,
      x,
      y,
    } = updatedUser;

    // if map was updated, update the rows
    if (Array.isArray(map)) {
      // update the user map to the lastet version, so we can create the preview stone
      this.map = this.map.map((row, index) => (map[index] ? map[index] : row));

      this.onMapChange();
    }

    // if block was updated, redraw the stone layer
    if (isSet(block) || isSet(x) || isSet(y) || isSet(rotation)) {
      // move down the
      this.rotation = updatedOrPrevious(this.rotation, this.rotation);
      this.y = updatedOrPrevious(y, this.y);
      this.x = updatedOrPrevious(x, this.x);

      if (isSet(block)) {
        this.block = updatedOrPrevious(block, this.block);
        this.onStoneChange();
      // update next block move timer
      } else if (isSet(y)) {
        this.nextBlockMove = Date.now() + this.speed;
      }
    }
  }

  /**
   * Add additional stop logic for the ui.
   */
  stop() {
    super.stop();
    this.onMessageListener();
    window.removeEventListener('keydown', this.userKeyEvent);
  }

  /**
   * New user key pres.
   *
   * @param $event keyboard event
   */
  userKeyEvent($event: KeyboardEvent) {
    this.lastKeyPressTime.push(Date.now());
    this.connection.send(WsMessageType.GAME_INPUT, $event.keyCode);
    this.onKeyPress($event.keyCode);
  }

  onMapChange() { /** will be overwritten by gameRenderer */ }

  onStoneMove() { /** will be overwritten by gameRenderer */ }

  onStoneChange() { /** will be overwritten by gameRenderer */ }
}
