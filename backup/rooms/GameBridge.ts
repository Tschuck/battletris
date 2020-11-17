import { GameDataInterface, GameStatus, getStringifiedMessage, parseMessage, ProcessMessageType } from '@battletris/shared';
import { ChildProcess, fork } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';
import GameUser from '../game/GameUser';
import roomRegistry from '../rooms';
import RoomHandler from '../rooms/RoomHandler';
import server from '../server';
import handleProcessMessage from './ProcessMessageHandler';

// file path to use to start a game process
const gameFilePath = path.resolve('./dist/src/game/GameProcess.js');

if (!existsSync(gameFilePath)) {
  throw new Error(`GameProcess file not found`);
}

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

  constructor(
    roomId: string,
    users: GameUser[] = [null,null,null,null,null,null],
  ) {
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
  async handleProcessMessage(message: string) {
    const { type, payload } = parseMessage(ProcessMessageType, message);
    handleProcessMessage(this, type as ProcessMessageType, payload);
  }

  /**
   * Log a message in context of a process.
   *
   * @param type server.log type
   * @param message message to log
   */
  log(type: string, message: string) {
    server.log[type](`[GAME][${this.process.pid}|${this.roomId}] ${message}`);
  }

  /**
   * Reset all states the game and reset game users.
   */
  reset() {
    this.data.status = GameStatus.STOPPED;
    this.data.users.forEach((user, index) => {
      if (user) {
        this.data.users[index] = new GameUser(user.id);
      }
    });
  }

  /**
   * start the game process, bind message handler and wait for process response.
   */
  async start() {
    this.data.status = GameStatus.STARTED;

    this.process = fork(gameFilePath, [], {
      silent: true,
      stdio: [ 'pipe', 'pipe', 'pipe', 'ipc' ]
    });

    // wait for process response
    this.initPromise = new Promise((resolve) => this.initResolve = resolve);

    // general message handling
    this.process.on('message', (message: string) => this.handleProcessMessage(message));
    this.process.on('error', (error) => this.log('error', error.message));
    this.process.stderr.on('data', (error) => this.log('error', error));
    this.process.on('exit', (code, sig) => this.log('info', `exited: ${code} / ${sig}`));

    // set the process and send the initial data to the child process
    this.sendToProcess(ProcessMessageType.INITIALIZE, this.data);

    // wait until initialized event was fired
    await this.initPromise;
  }

  /**
   * Send data to process.
   *
   * @param type message type
   * @param payload payload that should be sent to the process
   */
  sendToProcess(type: ProcessMessageType, payload?: any) {
    if (this.process) {
      this.process.send(getStringifiedMessage(type, payload));
    } else {
      this.log('info', `${type} was not sent to process: ${payload}`);
    }
  }

  /**
   * Stop the process
   */
  stop() {
    if (this.process) {
      this.sendToProcess(ProcessMessageType.STOP);
    }
  }
}