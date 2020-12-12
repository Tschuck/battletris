import { gameHelper, mapHelper, MatchStatsInterface, ProcessMessageType, WsMessageType } from '@battletris/shared';
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

        this.users.forEach((user) => user.map = numberToBlockMap(counter));
        this.sendGameUserUpdates();
        counter -= 1;
      };

      updateMap();
      const startLoop = setInterval(() => updateMap(), 1000);
    });

    this.users.forEach((user) => user.map = mapHelper.getEmptyMap(20));
    this.sendGameUserUpdates();
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
      this.users.push(new GameUser(users[userId], index, {
        userSpeed: config.userSpeed,
      }));
      this.indexIdMap[index] = userId;
    });

    logger.debug(`Game started with: ${this.userIds.join(', ')}`);
    // show countdown
    await this.initLoop();

    // start the actual game log
    this.users.forEach((user) => user.start());
    // directly show new blocks for the users
    this.sendGameUserUpdates();
  }

  /**
   * Transform the game into a json object
   */
  serialize() {
    const serialized = {
      // do not use user serialize! user serialize will only send updates
      users: this.users.map((user) => gameHelper.formatGameUser(user)),
      indexIdMap: this.indexIdMap,
    };

    return serialized;
  }

  /**
   * Send a incremental update to all users.
   */
  sendGameUserUpdates() {
    const update = this.users.map((user) => user.serialize());
    wsHandler.wsBroadcast(
      WsMessageType.GAME_USER_UPDATE,
      update,
    );
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