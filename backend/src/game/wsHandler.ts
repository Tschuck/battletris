import { ErrorCodes, getStringifiedMessage, parseMessage, WsMessageType } from '@battletris/shared';
import { Socket } from 'net';
import WebSocket from 'ws';
import game from './Game';
import logger from './logger';

const wss = new WebSocket.Server({ noServer: true });

class WsHandler {
  users: Record<string, WebSocket>;

  constructor() {
    this.users = {};
  }

  /**
   * Join the socket connection to the overhaul list.
   *
   * @param userId user id for the websocket
   * @param socket socket from server to use
  */
  join(headers: Record<string, string>, userId: string, socket: Socket) {
    logger.debug(`joined: ${userId}`);

    // handle websocket upgrade to be able to use the
    wss.handleUpgrade({ headers, method: 'GET' }, socket, [], async (ws: WebSocket) => {
      this.users[userId] = ws;

      // handle ws leave
      ws.on('close', () => {
        logger.debug(`closed connection: ${userId}`);
        // remove the user from the original server room
        // Do we need it?
        // processHandler.send(ProcessMessageType.LEAVE_ROOM, { userId });
        // remove from the users
        delete this.users[userId];
      });

      this.wsSend(userId, WsMessageType.GAME_UPDATE, game.serialize());

      // listen for messages
      this.listen(userId, ws);
    });
  }

  /**
   * Listen for websocket events.
   *
   * @param userId userId for that the ws is registered
   * @param ws websocket that is used
   */
  listen(userId: string, ws: WebSocket) {
    ws.on('message', (message) => {
      const { type, payload } = parseMessage(WsMessageType, message);

      if (!game.users[game.userIds.indexOf(userId)]) {
        return this.wsSend(userId, WsMessageType.ERROR, ErrorCodes.CONNECTION_NOT_JOINED);
      }

      switch (type) {
        case WsMessageType.GAME_INPUT: {
          game.users[game.userIds.indexOf(userId)].onNewStateChange(payload);
          break;
        }
      }
    });
  }

  /**
   * Send a type and a payload to all registered wsConnections.
   *
   * @param type type to send
   * @param payload payload to send
   * @param parser custom parser to be able to adjust a message for specific users
   */
  wsBroadcast(
    type: WsMessageType,
    payload?: any,
    parser?: (userId: string, index: number, payload: any) => any,
  ) {
    Object.keys(this.users).forEach((userId: string, index: number) => this.wsSend(
      userId,
      type,
      parser ? parser(userId, index, { ...payload }) : payload,
    ));
  }

  /**
   * Send a type and a payload to all registered wsConnections.
   *
   * @param userId user id to send the message to
   * @param type type to send
   * @param payload payload to send
   */
  wsSend(userId: string, type: WsMessageType, payload: any) {
    this.users[userId].send(getStringifiedMessage(type, payload), { binary: true });
  }
}

export default new WsHandler();
