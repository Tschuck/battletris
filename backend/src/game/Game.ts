import { gameHelper, mapHelper, MatchStatsInterface, ProcessMessageType, WsMessageType } from '@battletris/shared';
import { transformUserTransport, getDifference, GameStateChange } from '@battletris/shared/functions/gameHelper';
import { User } from '../db';
import config from '../lib/config';
import GameUser from './GameUser';
import numberToBlockMap from './helpers/numberToBlockMap';
import logger from './logger';
import processHandler from './processHandler';
import wsHandler from './wsHandler';

class Game {
  /** users ids mapped to the index to improve performance for incremental updates */
  indexIdMap: Record<number, string>;

  /** ensure game is started */
  isStarted = false;

  /** started date */
  started: Date;

  /** allow writing user data direct in the game class */
  users: GameUser[];

  /** all registered users */
  userIds: string[];

  /** should a update be sent to the game? */
  updateTriggered: NodeJS.Timeout;

  /**
   * Show countdown before starting the game loops of each user.
   */
  async initLoop() {
    let counter = config.startCounter;

    await new Promise<void>((resolve) => {
      const updateMap = () => {
        if (counter === 0) {
          clearInterval(startLoop);
          return resolve();
        }

        // update the users map with the start counter and send only the map to the users
        this.users.forEach((user) => user.map = numberToBlockMap(counter));
        this.sendFullUpdate();
        counter -= 1;
      };

      updateMap();
      const startLoop = setInterval(() => updateMap(), 1000);
    });
  }

  /**
   * Write all users into the game class.
   *
   * @param users users that are registered for the game
   */
  async start(users: Record<string, User>) {
    this.started = new Date();

    // access user ids faster => will never change
    this.userIds = Object.keys(users);
    this.users = [];
    this.indexIdMap = {};
    // setup game users
    this.userIds.forEach((userId, index) => {
      this.users.push(new GameUser({
        ...users[userId],
        speed: config.userSpeed,
      }, index));
      this.indexIdMap[index] = userId;
    });

    logger.debug(`Game started with: ${this.userIds.join(', ')}`);
    // show countdown
    await this.initLoop();
    // start the actual game log
    this.users.forEach((user) => user.start());
    // directly show new blocks for the users
    this.sendFullUpdate();
  }

  /**
   * Transform the game into a json object
   */
  serialize() {
    const serialized = {
      // do not use user serialize! user serialize will only send updates
      users: this.users.map((user) => gameHelper.transformUserTransport(user)),
      indexIdMap: this.indexIdMap,
    };

    return serialized;
  }

  /**
   * Sends an update to all users, including only the map property.
   */
  sendFullUpdate() {
    wsHandler.wsBroadcast(
      WsMessageType.GAME_USER_UPDATE,
      this.users.map((user) => transformUserTransport(user)),
    );
  }

  /**
   * Send a incremental update to all users.
   */
  sendGameUserUpdates() {
    // allow updates only every X ms
    if (this.updateTriggered) {
      return;
    }

    this.updateTriggered = setTimeout(() => {
      // allow next update
      this.updateTriggered = null;

      const update = this.users.map((user) => {
        // keep before states, so we can calculate a diff to the state without applied key presses
        const userEvents = [...user.userEvents];
        const beforeState = user.clone();

        // apply all changes to the user
        while (user.userEvents.length) {
          const userEvent = user.userEvents.shift();
          // adjust the current game state for the key
          user.handleStateChange(userEvent[0], userEvent);
        }

        // build the delta and apply the userEvents
        const difference = getDifference(user, beforeState);
        difference.userEvents = userEvents;
        return gameHelper.transformUserTransport(difference);
      });

      wsHandler.wsBroadcast(WsMessageType.GAME_USER_UPDATE, update);
    }, config.userUpdateInterval);
  }

  /**
   * When a user lost, check if the game ends. Will be triggered from game user.
   */
  onUserLost(userId: string) {
    const lostCount = this.users.filter((user) => user.lost).length;
    // allow guys without friends. usually stop the game, when only one player stands
    if (this.users.length === 1 && lostCount === 1 || lostCount === this.users.length - 1) {
      this.stop();
    }
  }

  /**
   * Game is finished. Create stats, send it to the parent and exit the process.
   */
  stop() {
    // determine winner
    const stats: MatchStatsInterface = {
      started: this.started,
      stopped: new Date(),
      users: {},
      winner: this.userIds[0],
    };

    // apply latest user stats
    this.users.forEach((user) => {
      stats.users[user.id] = {
        className: user.className,
        blockCount: user.blockCount,
        rowCount: user.rowCount,
      };
      // ensure timeout stopping
      user.stop();
    });

    processHandler.send(ProcessMessageType.GAME_STOP, stats);
    processHandler.exit();
  }
}

export default new Game();