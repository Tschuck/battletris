import { ErrorCodes, ProcessMessageType } from '@battletris/shared';
import { Socket } from 'net';
import wsHandler from './wsHandler';
import logger from './logger';
import game from './Game';

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
    process.on('message', (request, socket: Socket) => {
      const { type, payload } = request;

      if (type === ProcessMessageType.GAME_START) {
        return game.start(request.payload);
      } else if (!game.started) {
        return this.send(ProcessMessageType.ERROR, { error: ErrorCodes.GAME_NOT_STARTED });
      }

      switch (type) {
        case ProcessMessageType.WS_JOIN: {
          wsHandler.join(payload.headers, payload.userId, socket);
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
