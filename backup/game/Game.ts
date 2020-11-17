import { GameDataInterface, ProcessMessageType } from '@battletris/shared';
import config from '../lib/config';
import gameProcess from './GameProcess';
import numberToBlockMap from './helpers/numberToBlockMap';

export default class Game {
  data: GameDataInterface;

  gameLoop: NodeJS.Timeout;

  constructor() { }

  /**
   * Take initial information of the game from parent process.
   */
  async initialize(data: GameDataInterface) {
    this.data = data;
    gameProcess.sendToParent(ProcessMessageType.INITIALIZE, this.data);

    // show initial game counter
    let counter = config.startCounter;
    await new Promise((resolve) => {
      const updateMap = () => {
        counter -= 1;
        this.data.users.forEach((user, index) => {
          if (user) {
            user.map = numberToBlockMap(counter);
          }
        });

        gameProcess.sendToParent(
          ProcessMessageType.GAME_USER_UPDATE,
          this.data.users.map((user) => user ? { map: user.map } : null),
        );

        if (counter === 0) {
          clearInterval(startLoop);
          resolve();
        }
      };
      updateMap();
      const startLoop = setInterval(() => updateMap(), 1000);
    })

    this.gameLoop = setInterval(() => {
      // gameProcess.sendToParent(ProcessMessageType.TEST, {
      //   hello: 'from-server'
      // });
    }, 500);
  }

  keypress(key: string) {
    gameProcess.log('info', `key pressed: ${key}`);
  }

  stop() {
    // this.data.users.forEach((user) => user && clearInterval(user.gameLoop));
    gameProcess.sendToParent(ProcessMessageType.STOPPED);
    gameProcess.exit();
  }
}
