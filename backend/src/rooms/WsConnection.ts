import { SocketStream } from "fastify-websocket";
import cookieSignature from 'cookie-signature';

import roomRegistry from './registry';
import server from '../server';
import config from '../lib/config';
import errorCodes from '../lib/error.codes';
import RoomHandler from './RoomHandler';
import { User } from '../db';

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

  /**
   * Connected user
   */
  user: User;

  constructor(connection: SocketStream) {
    this.connection = connection;

    connection.socket.on('message', async (message: string) => {
      try {
        const { type, payload } = JSON.parse(message);

        if (type === 'joinGame') {
          this.joinGame(payload);
          return;
        }

        if (!this.room) {
          throw new Error(errorCodes.CONNECTION_NOT_JOINED);
        }

        switch (type) {
          case 'chat': {
            this.room.broadcastToWs('chat', {
              message: payload,
              id: this.user.id,
              name: this.user.name,
            });
            break;
          }
          default: {
            // this.room.sendToProcess(type, payload);
            break;
          }
        }
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
   * Websocket does not support onOpen payload, so we need to do this within a joinGame event.
   *
   * @param payload payload to initialize websocket connection
   */
  async joinGame(payload: JoinPayload) {
    // allow only one join per connection
    if (this.userId) {
      throw new Error(errorCodes.CONNECTION_ID_ALREADY_REGISTERED);
    }

    // check if UserId is correct
    const signedUserId = payload.id;
    const unsignedUserId = await cookieSignature.unsign(
      signedUserId,
      config.cookieSecret,
    );
    if (!unsignedUserId) {
      throw new Error(errorCodes.CONNECTION_ID_INVALID);
    }
    // set UserId
    this.userId = unsignedUserId;

    // register connection in game
    this.user = await User.findOne(this.userId);
    this.room = roomRegistry[payload.roomId];
    if (!this.room) {
      throw new Error(errorCodes.ROOM_NOT_STARTED);
    }
    this.room.addWsConnection(this);
  }

  async send(type: string, payload: any) {
    await this.connection.socket.send(JSON.stringify({ type, payload }));
  }
}
