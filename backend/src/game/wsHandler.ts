import { SocketStream } from 'fastify-websocket';
import processHandler from './processHandler';
import WebSocket from 'ws';
import logger from './logger';
import { getStringifiedMessage, parseMessage, ProcessMessageType, WsMessageType } from '@battletris/shared';

const wss = new WebSocket.Server({ noServer: true });

class WsHandler {
  connections: Set<WebSocket>;

  constructor() {
    this.connections = new Set();
  }

  /**
   * Join the socket connection to the overhaul list.
   *
   * @param userId user id for the websocket
   * @param socket socket from server to use
  */
  join(headers: Record<string, string>, userId: string, socket: SocketStream) {
    logger.debug(`joined: ${userId}`);

    // handle websocket upgrade to be able to use the
    wss.handleUpgrade({ headers, method: 'GET' }, socket, [], async (ws: WebSocket) => {
      this.connections.add(ws);

      // handle ws leave
      ws.on('close', () => {
        logger.debug(`closed connection: ${userId}`);
        // remove the user from the original server room
        processHandler.send(ProcessMessageType.LEAVE_ROOM, { userId });
        // remove from the connections
        this.connections.delete(ws);
        // if all connections were closed, exit the process
        if (this.connections.size === 0) {
          processHandler.exit();
        }
      });

      this.broadcast(WsMessageType.CHAT, {
        'message': 'hello from process',
      })

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

      switch (type) {
      }
    });
  }

  /**
   * Send a type and a payload to all registered wsConnections.
   *
   * @param type type to send
   * @param payload payload to send
   */
  broadcast(type: WsMessageType, payload: any) {
    this.connections.forEach((ws: WebSocket) => {
      ws.send(getStringifiedMessage(type, payload));
    });
  }
}

export default new WsHandler();
