import { ChildProcess, fork } from 'child_process';
import path from 'path';

import server from '../server';
import { GameDataInterface, GameStatus } from '../game/helpers/interfaces';
import GameUser from './GameUser';
import roomRegistry from '../rooms';
import RoomHandler from '../rooms/RoomHandler';

// file path to use to start a game process
const gameFilePath = path.resolve('./dist/game/index.js');

export default class GameHandler {
  /**
   * Current game data
   */
  data: GameDataInterface;

  /**
   * Sub process to handle the game loop.
   */
  process: ChildProcess;

  /**
   * Wait for process response
   */
  initPromise: Promise<void>;
  initResolve: () => void;

  /**
   * Room id for logging
   */
  roomId: string;

  /**
   * current rooms
   */
  room: RoomHandler;

  constructor(roomId: string, users: GameUser[] = []) {
    this.roomId = roomId;
    this.room = roomRegistry[roomId];
    this.data = {
      status: GameStatus.STOPPED,
      users: users,
    };
  }

  /**
   * handle incoming process messages
   *
   * @param message stringified process message
   */
  handleProcessMessage(message: string) {
    try {
      const { type, payload } = JSON.parse(message);

      switch (type) {
        // resolve the game creation and update the game data
        case 'initialized': {
          this.log('debug', 'initialized');
          this.data = payload;
          this.initResolve();
          break;
        }
        // user interacted with the game
        case 'log': {
          this.log(payload.type, payload.message);
          break;
        }
      }
    } catch (ex) {
      this.log('error', `not parsed: ${message} (${ex.message})`);
    }
  }

  /**
   * Log a message in context of a process.
   *
   * @param type server.log type
   * @param message message to log
   */
  log(type: string, message: string) {
    server.log[type](`[${this.process.pid}|${this.roomId}] ${message}`);
  }

  /**
   * start the game process, bind message handler and wait for process response.
   */
  async start() {
    this.process = fork(gameFilePath, [], {
      // silent: true,
      stdio: [ 'pipe', 'pipe', 'pipe', 'ipc' ]
    });

    // wait for process response
    this.initPromise = new Promise((resolve) => this.initResolve = resolve);

    // general message handling
    this.process.on('message', (message: string) => this.handleProcessMessage(message));
    this.process.on('exit', () => this.log('info', 'exited'));

    // set the process and send the initial data to the child process
    this.sendToProcess('initialize', { roomId: this.roomId });

    // wait until initialized event was fired
    await this.initPromise;
  }

  /**
   * Send data to process.
   *
   * @param type message type
   * @param payload payload that should be sent to the process
   */
  sendToProcess(type: string, payload: any) {
    this.process.send(JSON.stringify({ type, payload }));
  }

  /**
   * Stop the process
   */
  stop() {
    this.process.kill('SIGINT');
  }
}