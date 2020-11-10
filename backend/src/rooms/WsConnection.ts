import { SocketStream } from "fastify-websocket";
import cookieSignature from 'cookie-signature';
import { ErrorCodes, WsMessageType } from '@battletris/shared';

import roomRegistry from './registry';
import server from '../server';
import config from '../lib/config';
import RoomHandler from './RoomHandler';
import { User } from '../db';
import handleMessage from "./WsMessageHandler";

interface JoinPayload {
  // signed connection id
  id: string;
  // game to join
  roomId: string;
}

export default class WsConnection {
  /**
   * Open websocket connection.
   */
  connection: SocketStream;

  /**
   * websocket cookie connection id
   */
  userId: string;

  /**
   * Connected room.
   */
  room: RoomHandler;

  constructor(connection: SocketStream) {
    this.connection = connection;

    connection.socket.on('message', async (message: string) => {
      try {
        const { type, payload } = JSON.parse(message);

        if (type === WsMessageType.ROOM_JOIN) {
          await this.joinRoom(payload);
          return;
        }

        if (!this.room) {
          throw new Error(ErrorCodes.CONNECTION_NOT_JOINED);
        }

        await handleMessage(this.room, this, type, payload);
      } catch (ex) {
        connection.socket.send(JSON.stringify({ type: 'error', error: ex.message }));
        server.log.error(`[WS] not parsed: ${message} (${ex})`);
      }
    });

    connection.socket.on('close', (message: string) => {
      this.room?.removeWsConnection(this);
    });
  }

  /**
   * Websocket does not support onOpen payload, so we need to do this within a joinRoom event.
   *
   * @param payload payload to initialize websocket connection
   */
  async joinRoom(payload: JoinPayload) {
    // allow only one join per connection
    if (this.userId) {
      throw new Error(ErrorCodes.CONNECTION_ID_ALREADY_REGISTERED);
    }

    // check if UserId is correct
    const signedUserId = payload.id;
    const unsignedUserId = await cookieSignature.unsign(
      signedUserId,
      config.cookieSecret,
    );
    if (!unsignedUserId) {
      throw new Error(ErrorCodes.CONNECTION_ID_INVALID);
    }
    // set UserId
    this.userId = unsignedUserId;

    // register connection in game
    await User.findOneOrFail(this.userId);
    this.room = roomRegistry[payload.roomId];
    if (!this.room) {
      throw new Error(ErrorCodes.ROOM_NOT_STARTED);
    }
    this.room.addWsConnection(this);
    // update the frontends room user map
    await this.room.broadcastToWs(WsMessageType.ROOM_JOIN, {
      userId: this.userId,
      user: await User.findOne(this.userId),
    });
  }

  async send(type: WsMessageType, payload: any) {
    await this.connection.socket.send(JSON.stringify({ type, payload }));
  }
}
