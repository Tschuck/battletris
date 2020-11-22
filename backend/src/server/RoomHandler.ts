import { getStringifiedMessage, parseMessage, ProcessMessageType, WsMessageType } from '@battletris/shared';
import { ChildProcess, fork } from 'child_process';
import { Socket } from 'dgram';
import { existsSync } from 'fs';
import path from 'path';
import WebSocket from 'ws';
import Pino from 'pino';
import { Room } from '../db';
import config from '../lib/config';
import server from './server';
import { WebsocketHandler } from 'fastify-websocket';

// file path to use to start a game process
const gameFilePath = path.resolve('./dist/src/game/index.js');
if (!existsSync(gameFilePath)) {
  throw new Error(`GameProcess file not found`);
}

/** remember room instances */
export const rooms: Record<string, RoomHandler> = {};
/** used for connecting to websocket connections (upgrade event cannot handle async processes, so
 * validation will take place in separate action) */
export const roomAccess: Set<string> = new Set();

export default class RoomHandler {
  /**
   * Ensure room is initialized and exists in the db.
   * @param id  room id
   */
  static async ensure(id): Promise<RoomHandler> {
    await Room.findOneOrFail(id);
    if (!rooms[id]) {
      rooms[id] = new RoomHandler(id);
    }

    return rooms[id];
  }

  /**
   * room id
   */
  id: string;

  /**
   * game process
   */
  process: ChildProcess;

  /**
   * List of connected user ids.
   */
  users: {
    [userId: string]: WebSocket,
  }

  /**
   * room specific logger.
   */
  logger: Pino;

  constructor(id: string) {
    this.id = id;
    this.users = { };
    this.logger = Pino({
      prettyPrint: true,
      level: config.logLevel,
      base: {
        pid: process.pid,
        hostname: `ROOM|${this.id}`,
      }
    });
  }

  /**
   * Close the room and the corresponding process.
   */
  closeRoom() {
    if (rooms[this.id] || this.process) {
      this.log(`process closed: ${this.process?.pid}`);
      this.process = null;
      delete rooms[this.id];
    }
  }

  /**
   * Add a user to the specific game process. If no process was started, start it!
   *
   * @param headers request headers
   * @param userId user id to check
   * @param socket socket to add
   */
  processWsForward(headers: Record<string, string>, userId: string, socket: any) {
    try {
      // ensure game process is running
      if (!this.process) {
        this.processStart();
      }

      // forward socket connection to game process
      this.log(`user joined: ${this.process.pid}`);
      this.process.send({
        headers,
        roomId: this.id,
        type: ProcessMessageType.JOIN_ROOM,
        userId,
      }, socket);
    } catch (ex) {
      socket.write(ex.message);
      socket.close();
      socket.destroy();
    }
  }

  /**
   * Start the room process and listen for process messages, that needs to be synced.
   */
  processStart() {
    this.process = fork(gameFilePath, ['params'], {
      silent: true,
      env: {
        BATTLETRIS_IS_GAME: 'true',
        BATTLETRIS_LOG_LEVEL: config.logLevel,
        ROOM_ID: this.id,
        stdio: "inherit",
      },
    });

    this.log(`create process: ${this.process.pid}`);

    this.process.stdout.on('data', (data) => process.stdout.write(data));
    this.process.stderr.on('data', (data) => process.stderr.write(data));

    // ensure process is cleared, when its closed
    this.process.on('close', () => this.closeRoom());

    // handle process messages
    this.process.on('message', ({ type, payload }: any) => {
      switch (type) {
        case ProcessMessageType.LEAVE_ROOM: {
          this.log(`user left: ${payload.userId}`);
          this.users.delete(payload.userId);
          break;
        }
      }
    });
  }

  /**
   * Send a message to the room / game process.
   * @param type process message type
   * @param payload payload to send
   */
  processSend(type: ProcessMessageType, payload: any) {
    this.process.send({ type, payload });
  }

  log(message: string) {
    this.logger.debug(`${message}`);
  }

  /**
   * Send a type and a payload to all registered wsConnections.
   *
   * @param type type to send
   * @param payload payload to send
   */
  wsBroadcast(type: WsMessageType, payload: any) {
    Object.keys(this.users).forEach((userId: string) => {
      this.users[userId].send(getStringifiedMessage(type, payload));
    });
  }

  /**
   * Add a user to the room websocket and listen for messages!
   *
   * @param userId user id to check
   * @param socket socket to add
   */
  wsJoin(userId: string, ws: WebSocket) {
    this.users[userId] = ws;

    // handle ws leave
    ws.on('close', (...args) => {
      delete this.users[userId];
      if (Object.keys(this.users).length === 0) {
        this.closeRoom();
      }
    });

    this.wsListen(userId);
  }

  /**
   * Listen for websocket messages
   *
   * @param userId user id
   */
  wsListen(userId: string) {
    this.users[userId].on('message', (message: string) => {
      const { type, payload } = parseMessage(WsMessageType, message);

      switch (type) {
        case WsMessageType.CHAT: {
          this.wsBroadcast(WsMessageType.CHAT, {
            message: payload,
            id: userId,
          });

          break;
        }
      }
    });
  }
}
