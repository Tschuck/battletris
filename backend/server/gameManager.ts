import errorCodes from './error.codes';
import GameProcess from './GameProcess';

class GameManager {
  games: {
    [key: string]: GameProcess,
  };

  constructor() {
    this.games = {};
  }

  async create(name: string) {
    if (this.games[name]) {
      throw new Error(errorCodes.GAME_EXISTS);
    }

    this.games[name] = new GameProcess(name);
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
