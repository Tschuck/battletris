import { GameDataInterface, ProcessMessageType } from '@battletris/shared';
import gameProcess from './GameProcess';

export default class Game {
  data: GameDataInterface;

  gameLoopInterval: NodeJS.Timeout;

  constructor() { }

  /**
   * Take initial information of the game from parent process.
   */
  initialize(data: GameDataInterface) {
    this.data = data;
    gameProcess.sendToParent(ProcessMessageType.INITIALIZE, this.data);

    this.gameLoopInterval = setInterval(() => {
      gameProcess.sendToParent(ProcessMessageType.TEST, {
        hello: 'from-server'
      });
    }, 500);
  }

  keypress(key: string) {
    gameProcess.log('info', `key pressed: ${key}`);
  }

  stop(key: string) {
    clearInterval(this.gameLoopInterval);
    gameProcess.sendToParent(ProcessMessageType.STOPPED);
    process.exit();
  }
}
