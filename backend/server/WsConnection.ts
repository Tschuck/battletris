import { SocketStream } from "fastify-websocket";
import cookieSignature from 'cookie-signature';

import gameManager from './gameManager';
import server from './server';
import config from './config';
import errorCodes from './error.codes';
import GameHandler from './GameHandler';

interface JoinPayload {
  // signed connection id
  id: string;
  // class to use
  className: string;
  // game to join
  gameName: string;
  // user name
  name: string;
}

export default class WsConnection {
  /**
   * selected user class
   */
  className: string;

  /**
   * Open websocket connection.
   */
  connection: SocketStream;

  /**
   * websocket cookie connection id
   */
  connectionId: string;

  /**
   * Game, where the connection is currently connected to
   */
  gameName: string;

  /**
   * Opened game.
   */
  game: GameHandler;

  /**
   * user name
   */
  name: string;

  constructor(connection: SocketStream) {
    this.connection = connection;

    connection.socket.on('message', async (message: string) => {
      try {
        const { type, payload } = JSON.parse(message);

        if (type === 'joinGame') {
          this.joinGame(payload);
          return;
        }

        if (!this.game) {
          throw new Error(errorCodes.CONNECTION_NOT_JOINED);
        }

        switch (type) {
          case 'chat': {
            this.game.broadcastToWs('chat', {
              message: payload,
              name: this.name,
            });
            break;
          }
          default: {
            this.game.sendToProcess(type, payload);
            break;
          }
        }
      } catch (ex) {
        connection.socket.send(JSON.stringify({ type: 'error', error: ex.message }));
        server.log.error(`[WS] not parsed: ${message} (${ex})`);
      }
    });

    connection.socket.on('close', (message: string) => {
      this.game?.removeWsConnection(this);
    });
  }

  /**
   * Websocket does not support onOpen payload, so we need to do this within a joinGame event.
   *
   * @param payload payload to initialize websocket connection
   */
  async joinGame(payload: JoinPayload) {
    // allow only one join per connection
    if (this.connectionId) {
      throw new Error(errorCodes.CONNECTION_ID_ALREADY_REGISTERED);
    }

    // check if connectionid is correct
    const signedConnectionId = payload.id;
    const unsignedConnectionId = await cookieSignature.unsign(
      signedConnectionId,
      config.cookieSecret,
    );
    if (!unsignedConnectionId) {
      throw new Error(errorCodes.CONNECTION_ID_INVALID);
    }
    // set connectionId
    this.connectionId = unsignedConnectionId;

    // register connection in game
    this.gameName = payload.gameName;
    this.className = payload.className;
    this.name = payload.name;
    this.game = gameManager.games[this.gameName];
    if (!this.game) {
      throw new Error(errorCodes.GAME_NOT_EXISTS);
    }
    this.game.addWsConnection(this);
  }

  async send(type: string, payload: any) {
    await this.connection.socket.send(JSON.stringify({ type, payload }));
  }
}
