import GameConnection, { getCurrentConnection } from '@/lib/GameConnection';
import {
  gameHelper, GameUser, WsMessageType,
} from '@battletris/shared';
import {
  formatGameUser, GameStateChange, GameUserMapping, getDifference, HiddenGameUserMapping,
} from '@battletris/shared/functions/gameHelper';
import { cloneDeep } from 'lodash';
import currUser from '../../lib/User';

interface GameUserEvent {
  key: GameStateChange;
  id: number;
}

const isSet = (value: number|undefined) => value !== undefined;

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
    this.backendState = formatGameUser(user, {});
    Object.keys(user).forEach((key: string) => {
      (this as any)[key] = (user as any)[key];
    });

    this.connection = getCurrentConnection() as GameConnection;
    this.isCurrUser = currUser.id === user.id;
    this.onUpdate = onUpdate;

    // listen for backend updates
    this.onMessageListener = this.connection.onMessage((type: WsMessageType, data: any) => {
      if (type === WsMessageType.GAME_USER_UPDATE && data[this.gameUserIndex]) {
        const previousUiState = gameHelper.formatGameUser(this.serialize());

        // create the latest backend state out of the previous backend state and the new update
        gameHelper.applyStateUpdate(this.backendState, data[this.gameUserIndex]);
        // force overwrite the current ui state with the latest backend state
        gameHelper.applyStateUpdate(this, gameHelper.formatGameUser(this.backendState));
        // ensure to reset lastGamestate
        this.serialize();

        // remove old user events from the frontend user
        const userEvents = data[this.gameUserIndex][HiddenGameUserMapping.userEvents] || [];
        (userEvents || []).forEach(([, id]: number[]) => {
          const foundEvent = this.userEvents.findIndex(([, frontendId]) => id === frontendId);
          if (foundEvent !== -1) {
            this.userEvents.splice(foundEvent, 1);
          }
        });
        // apply now all new changes to the left backend states, that were not processed
        this.userEvents.forEach(([key]) => this.handleKeyEvent(key));

        // calculate update from the old ui state to the new ui state and apply it
        const uiUpdate = gameHelper.getDifference(this, previousUiState);
        console.log(gameHelper.formatGameUser(uiUpdate));

        // render it
        this.onUserUpdate(uiUpdate);
        // save latest backend state, diff is now applied
        this.backendState[HiddenGameUserMapping.userEvents] = [];
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
    gameHelper.applyStateUpdate(this, updatedUser);

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
    this.onNewStateChange($event.keyCode);
    setTimeout(() => {
      this.connection.send(WsMessageType.GAME_INPUT, $event.keyCode);
    }, 50 + (Math.random() * 100));
  }

  /**
   * User event was pushed to the userEvents array. We now need to render the change
   */
  sendUpdate(key: GameStateChange) {
    // keep the last state
    const lastState = cloneDeep(formatGameUser(this));
    // adjust the current game state for the key
    this.handleKeyEvent(key);
    // get the new state including the changes and persist them to the user lastState
    const newState = this.serialize();
    const diff = getDifference(newState, lastState);
    // calculate the difference and trigger a re-render
    this.onUserUpdate(gameHelper.formatGameUser(diff));
  }

  onMapChange() { /** will be overwritten by gameRenderer */ }

  onStoneMove() { /** will be overwritten by gameRenderer */ }

  onStoneChange() { /** will be overwritten by gameRenderer */ }
}
