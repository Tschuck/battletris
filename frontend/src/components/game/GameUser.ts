import GameConnection, { getCurrentConnection } from '@/lib/GameConnection';
import {
  gameHelper, GameUser, WsMessageType,
} from '@battletris/shared';
import {
  GameStateChange, GameUserMapping, getDifference,
} from '@battletris/shared/functions/gameHelper';
import currUser from '../../lib/User';

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
  backendUser: FrontendGameUser;

  /** notifiy the using class, that something has changed */
  onUpdate: (frontendUser: FrontendGameUser, userUpdate: Partial<GameUser>) => void;

  constructor(
    user: GameUser,
    gameUserIndex: number,
    onUpdate: (frontendUser: FrontendGameUser, userUpdate: Partial<GameUser>) => void,
  ) {
    super(user, gameUserIndex);

    this.connection = getCurrentConnection() as GameConnection;
    this.isCurrUser = currUser.id === user.id;
    this.onUpdate = onUpdate;

    // !IMPORTANT: copy latest values the backend information to this instance. Otherwise, we don't
    // have the latest data. Keep in mind, the incoming game user is just a value copy of the
    // backend, so we can just iterate the keys
    this.applyUserState(user);
    this.interactionCount = user.interactionCount;
    this.backendUser = this.clone();

    // listen for backend updates
    this.onMessageListener = this.connection.onMessage((type: WsMessageType, data: any) => {
      const plainUpdate = data[this.gameUserIndex];

      if (type === WsMessageType.GAME_USER_UPDATE && plainUpdate) {
        const previousUIUser = this.clone();
        const update = gameHelper.transformUserTransport(plainUpdate);
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
        console.log('----');
        console.log(JSON.stringify(userEvents));
        console.log(JSON.stringify(this.userEvents));
        console.log(this.userEvents.length);
        // apply now all new changes to the left backend states, that were not processed
        this.userEvents.forEach(([key]) => {
          console.log(`reapply key ${GameStateChange[key]}`);
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
    setTimeout(() => {
      this.connection.send(WsMessageType.GAME_INPUT, $event.keyCode);
    }, 1000 + (Math.random() * 100));
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
