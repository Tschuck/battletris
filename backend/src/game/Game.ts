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

      // save the before queue and the build the before user states before the update loop, so
      // abilities activation can access other users and diff will correctly be evaluated
      const beforeQueues = this.users.map((user) => [...user.queue]);
      const beforeStates = this.users.map((user) => user.clone());

      // apply the changes first, so the last user can activate a ability on the first user and
      // probably changes his values
      this.users.forEach((user) => {
        // apply all changes to the user and empty the queue
        while (user.queue.length) {
          const userEvent = user.queue.shift();
          // adjust the current game state for the key
          user.handleStateChange(userEvent[0], userEvent);
        }
      });

      // build the changes to sync from the original states
      const update = this.users.map((user, index) => {
        // build the delta and apply the queue
        const difference = getDifference(user, beforeStates[index]);
        // enforce queue sending, so user knows, which queue events were already calculated
        difference.queue = beforeQueues[index];

        // update fiels that were updated by side logic
        user.forceFieldUpdates.forEach((field) => {
          difference[field] = user[field];
        });
        // reset custom field updates
        user.forceFieldUpdates = [];

        return gameHelper.transformUserTransport(difference);
      });

      // send updates
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

    // clear update triggers
    clearTimeout(this.updateTriggered);

    // send out game stop message
    processHandler.send(ProcessMessageType.GAME_STOP, stats);
    // wait with closing of the process, until message was sent
    setTimeout(() => processHandler.exit(), 100);
  }
}

export default new Game();