const { api, } = require('actionhero');

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
      startCounter: 10,
      startTime: 0,
      status: 'open',
      time: 0,
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
      blockIndex: 0,
      connectionId: connectionId,
      effects: [ ],
      map: map,
      speed: 1,
    };
  }

  static getRandomBlock() {
    return {
      map: [ ],
      color: '',
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
    this.startingLoop = setInterval(async () => {
      this.battle.startCounter = this.battle.startCounter - 1;

      // clear the starting interval and start the game loop
      if (this.battle.startCounter === 0) {
        clearInterval(this.startingLoop);
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
    clearInterval(this.startingLoop);
    clearInterval(this.gameLoop);

    api.battletris.battles[this.roomName] = Battle.generateBattle();
    delete api.battletris.battleInstances[this.roomName];
  }

  /**
   * Starts the game loop.
   */
  async startGameLoop() {
    this.battle.status = 'started';
    this.battle.startTime = Date.now();

    // update the counter within the UI
    await api.chatRoom.broadcast({}, this.roomName, {
      type: 'battle-increment',
      battle: {
        startCounter: this.battle.startCounter,
        status: this.battle.status,
      }
    });

    this.gameLoop = setInterval(async () => {
      this.battle.duration = Date.now() - this.battle.startTime;

      await api.chatRoom.broadcast({}, this.roomName, {
        type: 'battle-increment',
        battle: {
          ...this.battle,
        },
      });
    }, 1000);
  }
}
