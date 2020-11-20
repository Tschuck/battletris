import { ProcessMessageType } from '@battletris/shared';
import { SocketStream } from 'fastify-websocket';
import wsHandler from './wsHandler';
import logger from './logger';

class ProcessHandler {
  keepAliveTimeout: NodeJS.Timeout;

  constructor() {
    this.keepAliveTimeout = setInterval(() => {}, 1 << 30);
    this.listen();
  }

  /**
   * Exit the process and clear the keep alive.
   */
  exit() {
    logger.debug('process exited');
    clearInterval(this.keepAliveTimeout);
    process.exit();
  }

  /**
   * Listen to process messages.
   */
  listen() {
    process.on('message', (request, socket: SocketStream) => {
      switch (request.type) {
        case ProcessMessageType.JOIN_ROOM: {
          wsHandler.join(request.headers, request.userId, socket);
          break;
        }
      }
    });
  }

  /**
   * Send message to parent process.
   * @param type type to sent
   * @param payload payload to sent
   */
  send(type: ProcessMessageType, payload: any) {
    process.send({ type, payload });
  }
}

export default new ProcessHandler();
