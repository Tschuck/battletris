import { ErrorCodes, GameUserStatus, getStringifiedMessage, parseMessage, ProcessMessageType, WsMessageType } from '@battletris/shared';
import { ChildProcess, fork } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';
import WebSocket from 'ws';
import Pino from 'pino';
import { Room, User } from '../db';
import config from '../lib/config';
import server from './server';

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

  /** room id */
  id: string;

  /** game process */
  process: ChildProcess;

  /** List of connected user ids */
  users: {
    [userId: string]: WebSocket,
  }

  /** room specific logger */
  logger: Pino;

  /** room specific logger */
  gameRegistration: Record<string, GameUserStatus>;

  constructor(id: string) {
    this.id = id;
    this.users = { };
    this.gameRegistration = { };
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
      this.log(`room closed: ${this.process?.pid}`);
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
        throw new Error(ErrorCodes.GAME_NOT_STARTED);
      }

      // forward socket connection to game process
      this.log(`user joined: ${this.process.pid}`);
      this.process.send({
        type: ProcessMessageType.WS_JOIN,
        payload: {
          userId,
          headers,
          roomId: this.id,
        }
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
  async processStart() {
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

    // send initial information for all registered users and their classes
    const startInfo = {};
    await Promise.all(Object.keys(this.gameRegistration).map(async (userId) => {
      const userEntity = await User.findOne(userId);
      startInfo[userId] = userEntity;
    }));
    this.processSend(ProcessMessageType.GAME_START, startInfo);

    // ensure process is cleared, when its closed
    this.process.on('close', () => this.closeRoom());
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
  wsBroadcast(type: WsMessageType, payload?: any) {
    Object.keys(this.users).forEach((userId: string) => this.wsSend(userId, type, payload));
  }

  /**
   * Send a type and a payload to all registered wsConnections.
   *
   * @param userId user id to send the message to
   * @param type type to send
   * @param payload payload to send
   */
  wsSend(userId: string, type: WsMessageType, payload: any) {
    this.users[userId].send(getStringifiedMessage(type, payload));
  }


  /**
   * Add a user to the room websocket and listen for messages!
   *
   * @param userId user id to check
   * @param socket socket to add
   */
  async wsJoin(userId: string, ws: WebSocket) {
    this.users[userId] = ws;

    // handle ws leave
    ws.on('close', () => {
      delete this.users[userId];
      delete this.gameRegistration[userId];
      // notify clients, that the user left the room
      this.wsBroadcast(WsMessageType.ROOM_LEAVE, { userId });
      if (Object.keys(this.users).length === 0) {
        this.closeRoom();
      }
    });

    this.wsBroadcast(WsMessageType.ROOM_JOIN, {
      user: await User.findOne(userId),
    });

    this.wsListen(userId);
  }

  /**
   * Listen for websocket messages
   *
   * @param userId user id
   */
  wsListen(userId: string) {
    this.users[userId].on('message', async (message: string) => {
      try {
        const { type, payload } = parseMessage(WsMessageType, message);

        server.log.debug(`[WS][${userId}]: ${WsMessageType[type]} ${JSON.stringify(payload)}`)

        if (type === WsMessageType.CHAT) {
          this.wsBroadcast(WsMessageType.CHAT, {
            message: payload,
            id: userId,
          });

          return;
        }

        switch (type) {
          case WsMessageType.GAME_JOIN: {
            // user has already joined this match
            if (this.gameRegistration[userId]) {
              throw new Error(ErrorCodes.CONNECTION_ID_ALREADY_REGISTERED);
            }
            if (Object.keys(this.gameRegistration).length === 6) {
              throw new Error(ErrorCodes.MAX_USERS);
            }
            this.gameRegistration[userId] = GameUserStatus.JOINED;
            break;
          }
          case WsMessageType.GAME_LEAVE: {
            // user has already joined this match
            if (!this.gameRegistration[userId]) {
              throw new Error(ErrorCodes.CONNECTION_NOT_JOINED);
            }

            delete this.gameRegistration[userId];
            break;
          }
          case WsMessageType.GAME_ACCEPT: {
            // user has already joined this match
            if (!this.gameRegistration[userId]) {
              throw new Error(ErrorCodes.CONNECTION_NOT_JOINED);
            }
            this.gameRegistration[userId] = GameUserStatus.ACCEPTED;
            break;
          }
          case WsMessageType.GAME_CANCEL: {
            // user has already joined this match
            if (!this.gameRegistration[userId]) {
              throw new Error(ErrorCodes.CONNECTION_NOT_JOINED);
            }
            this.gameRegistration[userId] = GameUserStatus.JOINED;
            break;
          }
        }

        // send latest game register update
        this.wsBroadcast(WsMessageType.GAME_REG_UPDATE, {
          [userId]: this.gameRegistration[userId] || '',
        });

        // check if game should be started
        const registeredIds = Object.keys(this.gameRegistration);
        const allStarted = !registeredIds.find(
          (id) => this.gameRegistration[id] === GameUserStatus.JOINED,
        );
        // ensure game process is running
        if (registeredIds.length !== 0 && allStarted) {
          await this.processStart();
          this.wsBroadcast(WsMessageType.GAME_STARTED);
        }
      } catch (ex) {
        server.log.error(ex.message);
        this.users[userId].send(WsMessageType.ERROR, { e: ex.message });
      }
    });
  }
}
