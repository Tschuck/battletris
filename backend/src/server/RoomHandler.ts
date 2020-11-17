import { SocketStream } from 'fastify-websocket';
import { ChildProcess, fork } from 'child_process';
import cookieSignature from 'cookie-signature';
import { existsSync } from 'fs';
import path from 'path';
import config from '../lib/config';
import { Room, User } from '../db';
import { ErrorCodes, ProcessMessageType } from '@battletris/shared';

// file path to use to start a game process
const gameFilePath = path.resolve('./dist/src/game/index.js');
if (!existsSync(gameFilePath)) {
  throw new Error(`GameProcess file not found`);
}

// remember room instances
const rooms: Record<string, RoomHandler> = {};

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

  id: string;

  users: Record<string, SocketStream> = {};

  process: ChildProcess;

  constructor(id: string) {
    this.id = id;
  }

  async joinUser(authToken: string, socket: any) {
    try {
      // ensure correct cookie usage
      if (!authToken) {
        throw new Error(ErrorCodes.BATTLETRIS_ID_ROOM_MISSING);
      }

      // check correct signed battletris_id
      const userId = await cookieSignature.unsign(
        authToken,
        config.cookieSecret,
      );

      // ensure that user and room exists
      await User.findOneOrFail(userId);
      if (this.users[userId]) {
        throw new Error(ErrorCodes.CONNECTION_ID_ALREADY_REGISTERED);
      }
      this.users[userId] = socket;
      // ensure user is removed from users
      this.users[userId].on('close', () => this.disconnect(userId));
      // ensure game process is running
      if (!this.process) {
        this.process = fork(gameFilePath);
      }
      // forward socket connection to game process
      this.process.send({
        roomId: this.id,
        type: ProcessMessageType.JOIN_WS,
        userId,
      }, socket);
    } catch (ex) {
      socket.write(ex.message);
      socket.close();
      socket.destroy();
    }
  }

  /**
   * Remove connection from users. If users are zero, stop child process
   *
   * @param userId  user id that is disconnected
   */
  async disconnect(userId: string)  {
    delete this.users[userId];
    if (Object.keys(this.users).length === 0) {
      this.process.send({
        type: ProcessMessageType.STOP,
      });
      this.process = null;
    }
  }
}