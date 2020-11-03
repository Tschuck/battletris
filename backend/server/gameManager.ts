import errorCodes from './error.codes';
import GameHandler from './GameHandler';

class GameManager {
  games: {
    [key: string]: GameHandler,
  };

  constructor() {
    this.games = {};
  }

  async create(name: string) {
    if (this.games[name]) {
      throw new Error(errorCodes.GAME_EXISTS);
    }

    this.games[name] = new GameHandler(name);
    await this.games[name].start();
  }

  async delete(name: string) {
    if (!this.games[name]) {
      throw new Error(errorCodes.GAME_NOT_EXISTS);
    }

    this.games[name].stop();
    delete this.games[name];
  }
};

export default new GameManager();
