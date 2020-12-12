import GameConnection, { getCurrentConnection } from '@/lib/GameConnection';
import {
  gameHelper, GameUser, WsMessageType,
} from '@battletris/shared';
import { formatGameUser } from '@battletris/shared/functions/gameHelper';
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

  /** function to remove window key press listener */
  keyDownListener: any;

  /** last user backup to check for changes with the backend */
  backendState: any;

  /** notifiy the using class, that something has changed */
  onUpdate: (frontendUser: FrontendGameUser, userUpdate: Partial<GameUser>) => void;

  constructor(
    user: GameUser,
    gameUserIndex: number,
    onUpdate: (frontendUser: FrontendGameUser, userUpdate: Partial<GameUser>) => void,
  ) {
    super({ id: user.id, className: user.className }, gameUserIndex, { userSpeed: user.speed });

    // !IMPORTANT: copy latest values the backend information to this instance. Otherwise, we don't
    // have the latest data. Keep in mind, the incoming game user is just a value copy of the
    // backend, so we can just iterate the keys
    this.backendState = formatGameUser(user);
    Object.keys(user).forEach((key: string) => {
      (this as any)[key] = (user as any)[key];
    });

    this.connection = getCurrentConnection() as GameConnection;
    this.isCurrUser = currUser.id === user.id;
    this.onUpdate = onUpdate;

    this.onMessageListener = this.connection.onMessage((type: WsMessageType, data: any) => {
      if (type === WsMessageType.GAME_USER_UPDATE && data[this.gameUserIndex]) {
        // calculate the latest updates from backend (you could be already 10 clicks away)
        const backendState = gameHelper.formatGameUser(this.backendState);
        const backendUpdate = gameHelper.formatGameUser(data[this.gameUserIndex]);
        gameHelper.mergeStateWithUpdate(backendState, backendUpdate);
      }
    });

    if (this.isCurrUser) {
      this.keyDownListener = ($event: KeyboardEvent) => this.userKeyEvent($event);
      window.addEventListener('keydown', this.keyDownListener);
    }

    // lets update the initial values
    onUpdate(this, this);
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

    // update the instance with the new values
    gameHelper.mergeStateWithUpdate(this, updatedUser);

    // checkup what should be rendered
    const {
      map, block, x, y, rotation,
    } = updatedUser;

    // if map was updated, update the rows
    if (Array.isArray(map)) {
      this.onMapChange();
    }

    // if block was updated, redraw the stone layer
    if (isSet(block) || isSet(x) || isSet(y) || isSet(rotation)) {
      if (isSet(block)) {
        this.onStoneChange();
      // update next block move timer
      } else {
        this.onStoneMove();
        if (isSet(y)) {
          this.nextBlockMove = Date.now() + this.speed;
        }
      }
    }

    this.onUpdate(this, updatedUser);
  }

  /**
   * Add additional stop logic for the ui.
   */
  stop() {
    super.stop();
    this.onMessageListener();
    window.removeEventListener('keydown', this.keyDownListener);
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

  sendUpdate() {
    this.onUserUpdate(gameHelper.formatGameUser(this.serialize()));
  }

  onMapChange() { /** will be overwritten by gameRenderer */ }

  onStoneMove() { /** will be overwritten by gameRenderer */ }

  onStoneChange() { /** will be overwritten by gameRenderer */ }
}
