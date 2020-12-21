import {
  gameHelper, GameUser, WsMessageType,
} from '@battletris/shared';
import {
  GameStateChange, getDifference,
} from '@battletris/shared/functions/gameHelper';
import GameConnection, { getCurrentConnection } from '../lib/GameConnection';
import currUser from '../lib/User';

const isSet = (value: number|undefined) => value !== undefined;

export default class FrontendGameUser extends GameUser {
  connection: GameConnection;

  /** is the current logged in user playing? */
  isCurrUser: boolean;

  /** used unbind to watch for new game message events */
  onMessageListener!: Function;

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
  backendUser: FrontendGameUser;

  /** notifiy the using class, that something has changed */
  onUpdate: (frontendUser: FrontendGameUser, userUpdate: Partial<GameUser>) => void;

  constructor(
    user: GameUser,
    gameUserIndex: number,
    onUpdate: (frontendUser: FrontendGameUser, userUpdate: Partial<GameUser>) => void,
  ) {
    // keep in mind to apply the latest user state again to the user with applyUserState. Incoming
    // game user is NOT a GameUser instance, so copy logic will not work
    super(user, gameUserIndex);
    this.applyUserState(user);
    this.interactionCount = user.interactionCount;
    this.backendUser = this.clone();

    // bind specific properties
    this.connection = getCurrentConnection() as GameConnection;
    this.isCurrUser = currUser.id === user.id;
    this.onUpdate = onUpdate;

    // lets update the initial values
    onUpdate(this, this);

    // bind key handler
    if (this.isCurrUser) {
      this.keyDownListener = ($event: KeyboardEvent) => this.userKeyEvent($event);
      window.addEventListener('keydown', this.keyDownListener);
    }

    // support single player
    if (!this.connection) {
      return;
    }

    // listen for backend updates with specific merging logic
    if (this.isCurrUser) {
      // only run heavy merging logic for the user that is interacting. For all other players,
      // we can just update the ui
      this.onMessageListener = this.connection.onMessage((type: WsMessageType, data: any) => {
        if (type === WsMessageType.GAME_USER_UPDATE && data[this.gameUserIndex]) {
          const update = gameHelper.transformUserTransport(data[this.gameUserIndex]);
          this.handleBackendUpdate(update);
        }
      });
    } else {
      this.onMessageListener = this.connection.onMessage((type: WsMessageType, data: any) => {
        if (type === WsMessageType.GAME_USER_UPDATE && data[this.gameUserIndex]) {
          const update = gameHelper.transformUserTransport(data[this.gameUserIndex]);
          this.onUserUpdate(update);
        }
      });
    }
  }

  /**
   * Does magic:
   *
   *  1. copy current UI state
   *  2. use the last known backend state and apply the new backend update and overwrite the
   *     current ui state with the last backend state
   *  3. clears processed user events from the user events array
   *  4. reapply all unprocessed user events again the the new user event
   *  5. calculate the diff between the old ui state and the new backend synced ui state
   *  6. render updates
   *
   * @param update update that is sent from the backend
   */
  handleBackendUpdate(update: Partial<GameUser>) {
    const previousUIUser = this.clone();
    const userEvents = update.userEvents || [];

    // create the latest backend state out of the previous backend state and the new update
    this.backendUser.applyUserState(update);
    // delete user events before they will overwrite the ui userEvents
    this.applyUserState(this.backendUser);
    // save latest backend state, diff is now applied
    this.backendUser = this.clone();
    this.backendUser.userEvents = [];

    // remove old user events from the frontend user
    userEvents.forEach(([, id]: number[]) => {
      const foundEvent = this.userEvents.findIndex(([, frontendId]) => id === frontendId);
      if (foundEvent !== -1) {
        this.userEvents.splice(foundEvent, 1);
      }
    });
    // apply now all new changes to the left backend states, that were not processed
    this.userEvents.forEach(([key]) => {
      this.handleStateChange(key);
      if (!key) {
        debugger;
      }
    });

    // calculate update from the old ui state to the new ui state and apply it
    const uiUpdate = gameHelper.getDifference(this, previousUIUser);
    // render it
    this.onUserUpdate(uiUpdate);
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
    this.applyUserState(updatedUser);

    // checkup what should be rendered
    const {
      map, block, x, y, rotation,
    } = updatedUser;

    // if map was updated, update the rows
    if (Array.isArray(map)) {
      this.onMapChange();
    }

    // if block was updated, redraw the stone layer
    //  - keep in mind to redraw the y preview when the map has changed
    if (isSet(block) || isSet(x) || isSet(y) || isSet(rotation) || Array.isArray(map)) {
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
    // ignore unknown key events
    if (!GameStateChange[$event.keyCode]) {
      return;
    }
    this.lastKeyPressTime.push(Date.now());
    this.onNewStateChange($event.keyCode);
    this.connection.send(WsMessageType.GAME_INPUT, $event.keyCode);
    // use this for latency debugging: TODO: test would be rly. awesome for this stuff :D
    // setTimeout(() => {
    //   this.connection.send(WsMessageType.GAME_INPUT, $event.keyCode);
    // }, 1000 + (Math.random() * 100));
  }

  /**
   * User event was pushed to the userEvents array. We now need to render the change
   */
  sendUpdate(key: GameStateChange) {
    // keep the last state
    const lastState = this.clone();
    // adjust the current game state for the key
    this.handleStateChange(key);
    // get the new state including the changes and persist them to the user lastState
    const diff = getDifference(this, lastState);
    // calculate the difference and trigger a re-render
    this.onUserUpdate(diff);
  }

  onMapChange() { /** will be overwritten by gameRenderer */ }

  onStoneMove() { /** will be overwritten by gameRenderer */ }

  onStoneChange() { /** will be overwritten by gameRenderer */ }
}
