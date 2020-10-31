import processHandler from './processHandler';
import GameDataInterface from './GameDataInterface';

export default class Game {
  data: GameDataInterface;

  constructor() { }

  /**
   * Take initial information of the game from parent process.
   */
  initialize({ name }) {
    this.data = { name };
    processHandler.sendToParent('initialized', this.data);
  }

  keypress(key: string) {
    processHandler.log('info', `key pressed: ${key}`);
  }
}
