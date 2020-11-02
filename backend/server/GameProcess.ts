import { ChildProcess, fork } from 'child_process';
import path from 'path';

import server from './server';
import GameDataInterface from '../game/GameDataInterface';
import { SocketStream } from 'fastify-websocket';

// file path to use to start a game process
const gameFilePath = path.resolve('./dist/game/index.js');

interface UserConnection {
  /**
   * unsigned cookie connectionId
   */
  connectionId: string;

  /**
   * Opened websocket connection
   */
  connection: SocketStream;
}

export default class GameProcess {
  /**
   * Open wsConnections
   */
  wsConnections: UserConnection[];

  /**
   * Current game data
   */
  data: GameDataInterface;

  /**
   * Sub process to handle the game loop.
   */
  process: ChildProcess;

  /**
   * game name
   */
  name: string;

  /**
   * Wait for process response
   */
  initPromise: Promise<void>;
  initResolve: () => void;

  constructor(name: string) {
    this.wsConnections = [];
    this.name = name;
  }

  /**
   * Add connection to the game process. (used for message broadcasting)
   *
   * @param connectionId unsigned cookie connection id
   * @param connection current open websocket connection
   */
  addWsConnection(connectionId: string, connection: SocketStream) {
    this.log('debug', `added connection: ${connectionId}`);
    this.wsConnections.push({
      connection,
      connectionId,
    });
  }

  /**
   * Send a type and a payload to all registered wsConnections.
   *
   * @param type type to send
   * @param payload payload to send
   */
  async broadcastToWs(type: string, payload: any) {
    await Promise.all(this.wsConnections.map(({ connection }) => {
      connection.socket.send(JSON.stringify({ type, payload }));
    }));
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
    server.log[type](`[${this.process.pid}|${this.name}] ${message}`);
  }

  /**
   * Remove connection from the game process.
   *
   * @param connectionId unsigned cookie connection id
   */
  removeWsConnection(connectionId: string) {
    this.wsConnections.splice(this.wsConnections.findIndex(
      (c) => c.connectionId === connectionId),
      1,
    );
    this.log('debug', `removed connection: ${connectionId}`);
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
    this.sendToProcess('initialize', { name: this.name });

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
    this.process.kill('SIGINT'); // ???
  }
}