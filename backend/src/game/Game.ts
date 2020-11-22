import { GameUserStatus } from '@battletris/shared';
import { User } from '../db';
import GameUser from './GameUser';
import logger from './logger';

class Game {
  /** ensure game is started */
  isStarted = false;

  /** allow writing user data direct in the game class */
  users: GameUser[];

  /** users ids mapped to the index to improve performance for incremental updates */
  indexIdMap: Record<number, string>;

  /** all registered users */
  userIds: string[];

  /**
   * Write all users into the game class.
   *
   * @param users users that are registered for the game
   */
  start(users: Record<string, User>) {
    // access user ids faster => will never change
    this.userIds = Object.keys(users);
    this.users = [];
    this.indexIdMap = {};
    // setup game users
    this.userIds.forEach((userId) => {
      this.users.push(new GameUser(users[userId]));
      this.indexIdMap[this.users.length - 1] = userId;
    });

    this.isStarted = true;
    logger.debug(`Game started with: ${this.userIds.join(', ')}`)
  }

  /**
   * Transform the game into a json objectg
   */
  serialize() {
    const serialized = {
      users: this.users.map((user) => user.serialize()),
      indexIdMap: this.indexIdMap,
    };

    return serialized;
  }
}

export default new Game();