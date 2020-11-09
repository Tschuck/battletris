import gameProcess from './GameProcess';
import { GameDataInterface } from './helpers/interfaces';

export default class Game {
  data: GameDataInterface;

  constructor() { }

  /**
   * Take initial information of the game from parent process.
   */
  initialize(data: GameDataInterface) {
    this.data = data;
    gameProcess.sendToParent('initialized', this.data);
  }

  keypress(key: string) {
    gameProcess.log('info', `key pressed: ${key}`);
  }
}
