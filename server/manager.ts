import path from 'path';
import { ChildProcess, fork } from 'child_process';

import errorCodes from './error.codes';
import server from './server';
import GameDataInterface from '../game/GameData';

const gameFilePath = path.resolve('../game/index.js');

class Manager {
  games: {
    [key: string]: GameDataInterface,
  };

  processes: {
    [key: string]: ChildProcess,
  };

  constructor() {
    this.games = {};
    this.processes = {};
  }

  async create(name: string) {
    if (this.games[name]) {
      throw new Error(errorCodes.GAME_EXISTS);
    }

    const gameProcess = fork(gameFilePath, [], {
      // silent: true,
      stdio: [ 'pipe', 'pipe', 'pipe', 'ipc' ]
    });

    gameProcess.on('message', message => {
      server.log.info('message from child:', message);
      gameProcess.send('Hi');
    });

    server.log.info(`[SUB-PROCESS] ${name} - ${gameProcess.pid}`);

    this.processes[name] = gameProcess;
    this.games[name] = { name };
  }

  async delete(name: string) {
    if (!this.games[name]) {
      throw new Error(errorCodes.GAME_NOT_EXISTS);
    }

    this.processes[name].kill('SIGINT'); // ???
    delete this.games[name];
  }
};

export default new Manager();
