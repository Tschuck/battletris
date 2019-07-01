const { api, } = require('actionhero');
const blocks = require('./blocks');

module.exports = class Battle {
  /**
   * Generate battle data structure
   */
  static generateBattle() {
    return {
      accepted: { },
      blocks: [ ],
      duration: 0,
      speed: 1,
      startCounter: 1,
      startTime: 0,
      status: 'open',
      time: 0,
      userKeys: [ ],
      users: { },
    };
  }

  /**
   * Generates a new empty game map.
   *
   * @param      {string}  connectionID  connection id
   * @return     {Object}  new battle user structure
   */
  static generateBattleUser(connectionId) {
    const map = [ ];

    for (let y = 0; y < 20; y++) {
      map.push([...Array(10)]);
    }

    return {
      blockIndex: -1,
      connectionId: connectionId,
      effects: [ ],
      map: map,
      speed: 1,
    };
  }

  /**
   * Returns a new random block
   *
   * @return     {any}  block definition
   */
  static generateRandomBlock() {
    const type = Math.round(Math.random() * 6);

    return {
      map: blocks[type](),
      type,
      x: 3,
      y: 0,
    };
  }

  constructor(roomName) {
    this.roomName = roomName;
    this.battle = api.battletris.battles[roomName];
  }

  /**
   * Start the runtime interval.
   */
  async start() {
    this.battle.status = 'starting';

    // wait for 10 seconds until starting the game
    this.startingLoopInterval = setInterval(async () => {
      this.battle.startCounter = this.battle.startCounter - 1;

      // clear the starting interval and start the game loop
      if (this.battle.startCounter === 0) {
        clearInterval(this.startingLoopInterval);
        this.startGameLoop();
      } else {
        // update the counter within the UI
        await api.chatRoom.broadcast({}, this.roomName, {
          type: 'battle-increment',
          battle: {
            startCounter: this.battle.startCounter,
            status: this.battle.status,
          }
        });
      }
    }, 1000);
  }

  /**
   * Stop the runtime interval
   */
  stop() {
    clearInterval(this.startingLoopInterval);
    clearInterval(this.gameLoopInterval);

    api.battletris.battles[this.roomName] = Battle.generateBattle();
    delete api.battletris.battleInstances[this.roomName];
  }

  /**
   * Starts the game loop.
   */
  async startGameLoop() {
    this.battle.status = 'started';
    this.battle.startTime = Date.now();
    this.battle.userKeys = Object.keys(this.battle.users);

    // update the counter within the UI
    await api.chatRoom.broadcast({}, this.roomName, {
      type: 'battle-increment',
      battle: {
        startCounter: this.battle.startCounter,
        status: this.battle.status,
      }
    });

    // start the game!
    await this.gameLoop();
    this.gameLoopInterval = setInterval(async () => this.gameLoop(), 1000);
  }

  /**
   * Handle overhaul interactions.
   */
  async gameLoop() {
    // fast access
    const blocks = this.battle.blocks;

    // set general data
    this.battle.duration = Date.now() - this.battle.startTime;

    // set user data
    this.battle.userKeys.forEach((userKey) => {
      // user has not left the game during game loop
      if (this.battle.users[userKey]) {
        const user = this.battle.users[userKey];

        // TODO: implement next stone generation
        if (user.blockIndex === -1 || false) {
          user.blockIndex++;

          // generate new blocks
          if (!blocks[user.blockIndex]) {
            blocks.push(Battle.generateRandomBlock());
          }

          // set active block
          user.activeBlock = blocks[user.blockIndex];
        } else {
          // move block down
          user.activeBlock.y = user.activeBlock.y + 1;
        }
      }
    });

    await api.chatRoom.broadcast({}, this.roomName, {
      type: 'battle-increment',
      battle: {
        ...this.battle,
      },
    });
  }

  /**
   * Handles a user action
   *
   * @param      {<type>}   connectionId  The connection identifier
   * @param      {<type>}   key           The key
   * @return     {Promise}  { description_of_the_return_value }
   */
  async userAction(connectionId, key) {
    const battleUser = this.battle.users[connectionId];
    const activeBlock = battleUser.activeBlock;

    // setup update increment 
    const users = {};
    const increment = { };
    users[connectionId] = increment;

    switch (key) {
      // left
      case 37: {
        activeBlock.x--;
        increment.activeBlock = activeBlock;
        break;
      }
      // up
      case 38: {
        break;
      }
      // right
      case 39: {
        activeBlock.x++;
        increment.activeBlock = activeBlock;
        break;
      }
      // down
      case 40: {
        activeBlock.y++;
        increment.activeBlock = activeBlock;
        break;
      }
    }

    await api.chatRoom.broadcast({}, this.roomName, {
      type: 'battle-increment',
      battle: {
        users
      },
    });
  }
}
