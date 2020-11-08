import gameProcess from './GameProcess';
import { GameDataInterface } from './helpers/interfaces';

export default class Game {
  data: GameDataInterface;

  constructor() { }

  /**
   * Take initial information of the game from parent process.
   */
  initialize({ name }) {
    // this.data = { name };
    gameProcess.sendToParent('initialized', this.data);
  }

  keypress(key: string) {
    gameProcess.log('info', `key pressed: ${key}`);
  }
}
