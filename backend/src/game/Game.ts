import { GameDataInterface, ProcessMessageType } from '@battletris/shared';
import gameProcess from './GameProcess';

export default class Game {
  data: GameDataInterface;

  constructor() { }

  /**
   * Take initial information of the game from parent process.
   */
  initialize(data: GameDataInterface) {
    this.data = data;
    gameProcess.sendToParent(ProcessMessageType.INITIALIZE, this.data);
  }

  keypress(key: string) {
    gameProcess.log('info', `key pressed: ${key}`);
  }
}
