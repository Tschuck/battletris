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
      try {
        // extract message payload
        const { type, payload } = JSON.parse(message);
        // run game function
        if (this.game[type]) {
          this.game[type](payload);
        } else {
          throw new Error(`unknown message type ${type}`);
        }
      } catch (ex) {
        this.log('error', `not parsed: ${message} (${ex.message})`);
      }
    });
  }

  /**
   * Sends the specified payload stringified to the parent process.
   *
   * @param type message type
   * @param payload payload for the type (currently not specified, it's fully dynamic)
   */
  sendToParent(type: string, payload?: any) {
    process.send(JSON.stringify({ type, payload }));
  }

  /**
   * Log something using the parent process.
   *
   * @param type info, error, debug, trace
   * @param message message to log via parent process
   */
  log(type: string, message: string) {
    this.sendToParent('log', { type, message });
  }
};

export default new ProcessHandler();