import path from 'path';
import { ChildProcess, fork } from 'child_process';

import errorCodes from './error.codes';
import server from './server';
import GameDataInterface from '../game/GameDataInterface';

// file path to use to start a game process
const gameFilePath = path.resolve('./dist/game/index.js');

class GameManager {
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

    let initResolve;
    const initPromise = new Promise((resolve) => initResolve = resolve);

    gameProcess.on('message', (message: string) => {
      try {
        const { type, payload } = JSON.parse(message);

        switch (type) {
          // resolve the game creation and update the game data
          case 'initialized': {
            this.games[name] = payload;
            initResolve();
            break;
          }
          // user interacted with the game
          case 'log': {
            server.log[payload.type](`[${name}|${gameProcess.pid}][GAME] ${payload.message}`);
            break;
          }
        }
      } catch (ex) {
        server.log.error(`[${gameProcess.pid}|${name}] not parsed: ${message}`);
      }
    });

    // set the process and send the initial data to the child process
    this.processes[name] = gameProcess;
    this.sendToGame(name, 'initialize', {
      name,
    });
    // wait until initialized event was fired
    await initPromise;
  }

  async delete(name: string) {
    if (!this.games[name]) {
      throw new Error(errorCodes.GAME_NOT_EXISTS);
    }

    this.processes[name].kill('SIGINT'); // ???
    delete this.games[name];
  }

  sendToGame(name: string, type: string, payload: any) {
    this.processes[name].send(JSON.stringify({ type, payload }));
  }
};

export default new GameManager();
