import { getStringifiedMessage, parseMessage, ProcessMessageType } from '@battletris/shared';
import process from 'process';

import Game from './Game';

class ProcessHandler {
  game: Game;

  constructor() {
    this.game = new Game();
    this.listen();
  }

  /**
   * Listen to parent process messages and pass them into the Game instance
   */
  listen() {
    process.on('message', (message: string) => {
      const { type, payload } = parseMessage(ProcessMessageType, message);

      try {
        // run game function
        if (this.game[type]) {
          this.game[type](payload);
        } else {
          this.log('error', `unknown message type: ${ProcessMessageType[type]}`);
        }
      } catch (ex) {
        this.log('error', `[${ProcessMessageType[type]}]: ${payload} (${ex.message})`);
      }
    });
  }

  /**
   * Sends the specified payload stringified to the parent process.
   *
   * @param type message type
   * @param payload payload for the type (currently not specified, it's fully dynamic)
   */
  sendToParent(type: ProcessMessageType, payload?: any) {
    process.send(getStringifiedMessage(type, payload));
  }

  /**
   * Log something using the parent process.
   *
   * @param type info, error, debug, trace
   * @param message message to log via parent process
   */
  log(type: string, message: string) {
    this.sendToParent(ProcessMessageType.LOG, { type, message });
  }
};

export default new ProcessHandler();
