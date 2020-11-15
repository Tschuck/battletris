import { GameDataInterface, GameStatus, getStringifiedMessage, parseMessage, ProcessMessageType } from '@battletris/shared';
import { ChildProcess, fork } from 'child_process';
import path from 'path';
import roomRegistry from '../rooms';
import RoomHandler from '../rooms/RoomHandler';
import server from '../server';
import GameUser from './GameUser';

// file path to use to start a game process
const gameFilePath = path.resolve('./dist/game/GameProcess.js');

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
  handleProcessMessage(message: string) {
    const { type, payload } = parseMessage(ProcessMessageType, message);

    try {
      switch (type) {
        // user interacted with the game
        case ProcessMessageType.LOG: {
          this.log(payload.type, payload.message);
          break;
        }
        // resolve the game creation and update the game data
        case ProcessMessageType.INITIALIZE: {
          this.log('debug', 'initialized');
          this.data = payload;
          this.initResolve();
          break;
        }
        default: {
          this.log('error', `unknown message type: ${ProcessMessageType[type]}`);
          break;
        }
      }
    } catch (ex) {
      this.log('error', `[GAME_BRIDGE] not parsed: ${message} (${ex.message})`);
    }
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
   * start the game process, bind message handler and wait for process response.
   */
  async start() {
    this.data.status = GameStatus.STARTED;
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
  sendToProcess(type: ProcessMessageType, payload: any) {
    this.process.send(getStringifiedMessage(type, payload));
  }

  /**
   * Stop the process
   */
  stop() {
    this.process.kill('SIGINT');
  }
}