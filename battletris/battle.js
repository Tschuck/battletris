const { api, } = require('actionhero');
const blocks = require('./blocks');
const mapHandler = require('./mapHandler');

module.exports = class Battle {
  /**
   * Returns a new random block
   *
   * @return     {any}  block definition
   */
  static generateRandomBlock() {
    const type = Math.round(Math.random() * 6);

    return {
      map: blocks[type][0],
      rotation: 0,
      type,
      x: 3,
      y: 0,
    };
  }

  constructor(roomName) {
    this.roomName = roomName;
    this.users = { };

    // set initial structur for map and so on
    this.initialize();
  }

  /**
   * Set initial values for the battle, without resetting the users
   */
  initialize() {
    this.blocks = [ ];
    this.config = JSON.parse(JSON.stringify(api.config.battletris));
    this.duration = 0;
    this.gameLoopTimeout = 1;
    this.startCounter = 1;
    this.startTime = 0;
    this.status = 'open';
    this.time = 0;
  }

  /**
   * Transforms the battle data into an json object, so we will not try to send object instances to
   * the ui.
   */
  getJSON() {
    const jsonResult = { };
    [
      'blocks', 'config', 'duration', 'roomName', 'startCounter', 'startTime',
      'status', 'time', 'users',
    ].forEach(key => jsonResult[key] = this[key]);
    return jsonResult;
  }

  /**
   * Builds a user object and applies them into the joined users into the current battle state.
   *
   * @param      {string}  connectionId  connection id
   * @param      {any}     [user={}]     the previous user structure, to keep old states
   */
  join(connectionId, user = { }) {
    const map = [ ];

    for (let y = 0; y < 20; y++) {
      map.push([...Array(10)]);
    }

    // connection id
    user.connectionId = connectionId;
    // keep old status of the user (open, joined, accepted, lost, won)
    user.status = user.status || 'open';
    // users full map
    user.map = map;
    // block turn (press up)
    user.blockIndex = -1;
    // buffs / debuffs
    user.effects = [ ];
    // amount of mana
    user.mana = 0;
    // cleared rows
    user.rows = 0;
    // users speed
    user.speed = 1;

    // clear previous active block, so a old one does not will be displayed during start a new game
    // set it to an empty array to force reloading
    user.activeBlock = [ ];

    // apply the user to the battle
    this.users[connectionId] = user;
  }

  /**
   * Just remove a connection from the users object.
   *
   * @param      {string}  connectionId  the connection id that should be removed
   */
  leave(connectionId) {
    delete this.users[connectionId];
  }

  /**
   * Start the runtime interval.
   */
  async start() {
    this.status = 'starting';

    // reset latest user values
    Object.keys(this.users).forEach(userId => this.join(userId, this.users[userId]));

    // wait for 10 seconds until starting the game
    this.startingLoopInterval = setInterval(async () => {
      this.startCounter = this.startCounter - 1;

      // clear the starting interval and start the game loop
      if (this.startCounter === 0) {
        clearInterval(this.startingLoopInterval);
        this.startGameLoop();
      } else {
        // update the counter within the UI
        await api.chatRoom.broadcast({}, this.roomName, {
          type: 'battle-increment',
          battle: {
            startCounter: this.startCounter,
            status: this.status,
          }
        });
      }
    }, 1000);
  }

  /**
   * Stop the runtime interval
   */
  stop() {
    // clear listeners 
    clearInterval(this.startingLoopInterval);
    clearInterval(this.gameLoopInterval);

    // reset to initial battle values
    this.initialize();

    // send new battle update
    return api.chatRoom.broadcast({}, this.roomName, {
      type: 'battle',
      battle: this.getJSON(),
    });
  }

  /**
   * Starts the game loop.
   */
  async startGameLoop() {
    this.status = 'started';
    this.startTime = Date.now();

    // update the counter within the UI
    await api.chatRoom.broadcast({}, this.roomName, {
      type: 'battle-increment',
      battle: {
        startCounter: this.startCounter,
        status: this.status,
      }
    });

    // start the game!
    await this.gameLoop();
    clearInterval(this.gameLoopInterval);
    this.gameLoopInterval = setInterval(
      async () => this.gameLoop(),
      this.config.gameLoopTimeout
    );
  }

  /**
   * Handle overhaul interactions.
   */
  async gameLoop() {
    // set general data
    this.duration = Date.now() - this.startTime;

    // increase speed every X seconds
    if ((this.duration % this.config.increaseInterval) === 0) {
      // reduce the gameLoopTimeout
      this.config.gameLoopTimeout = this.config.gameLoopTimeout -
        this.config.increaseSteps;

      // restart game interval
      clearInterval(this.gameLoopInterval);
      this.gameLoopInterval = setInterval(
        () => this.gameLoop(),
        this.config.gameLoopTimeout
      );
    }

    // set user data
    Object.keys(this.users).forEach((connectionId) => {
      // user has not left the game during game loop
      if (this.users[connectionId]) {
        // TODO: implement next stone generation
        if (this.users[connectionId].blockIndex === -1) {
           this.setNextBlock(connectionId);
        } else {
          // move block down
          this.userAction(connectionId, 40);
        }
      }
    });

    await api.chatRoom.broadcast({}, this.roomName, {
      type: 'battle-increment',
      battle: {
        ...this.getJSON(),
      },
    });
  }

  /**
   * Returns the newly generated next active block for a specific user.
   */
  setNextBlock(connectionId) {
    // increase block index
    this.users[connectionId].blockIndex++;

    // generate new blocks
    if (!this.blocks[this.users[connectionId].blockIndex]) {
      this.blocks.push(Battle.generateRandomBlock());
    }

    // set active block
    this.users[connectionId].activeBlock = this.blocks[this.users[connectionId].blockIndex];
  }

  /**
   * Handles a user action
   *
   * @param      {<type>}   connectionId  The connection identifier
   * @param      {<type>}   key           The key
   * @return     {Promise}  { description_of_the_return_value }
   */
  async userAction(connectionId, key) {
    const battleUser = this.users[connectionId];
    let originBlock = battleUser.activeBlock;
    let activeBlock = JSON.parse(JSON.stringify(originBlock));

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
        // if it's not a block, turn it
        if (activeBlock.type !== 3) {
          activeBlock.rotation = activeBlock.rotation === 3 ? 0 : activeBlock.rotation + 1;
          activeBlock.map = blocks[activeBlock.type][activeBlock.rotation];
          increment.activeBlock = activeBlock;
        }
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
      // press space
      case 32: {
        // move the original block to the next dock position
        originBlock = mapHandler.getDockPreview(battleUser.map, activeBlock);
        // assign the new original block to the current battleUser active block position, so the
        // collision logic will render this block as docked
        activeBlock = JSON.parse(JSON.stringify(originBlock));
        // after this, increase the y position by one, so a collision will be generated
        activeBlock.y++;
        break;
      }
    }

    // check if the action can be performed
    const collision = mapHandler.checkForCollision(battleUser.map, activeBlock, battleUser.activeBlock);
    switch (collision) {
      // if the stone movement was invalid, stop it!
      case 'invalid': {
        return;
      }
      // dock the activeBlock to the map and generate a new activeBlock
      case 'docked': {
        // IMPORTANT: use the battleUser.activeBlock, before the navigation was performed
        for (let y = 0; y < originBlock.map.length; y++) {
          for (let x = 0; x < originBlock.map[y].length; x++) {
            if (originBlock.map[y][x]) {
              if (originBlock.y + y === 0) {
                battleUser.status = increment.status = 'lost';
                break;
              } else {
                battleUser.map[originBlock.y + y][originBlock.x + x] = {
                  type: originBlock.type,
                };
              }
            }
          }

          // just break the for loop and check for a winner
          if (battleUser.status === 'lost') {
            const wonUsers = Object
              .keys(this.users)
              .filter((userKey) => this.users[userKey].status !== 'lost');

            // if one player has played alone or one player has left, he won  
            if (wonUsers.length < 2) {
              this.status = 'open';

              // set the won user
              if (wonUsers.length === 1) {
                this.users[wonUsers[0]].status = 'won'; 
              }

              // one user has won and game has been stopped stop the game
              return this.stop();
            }

            break;
          }
        }

        // check for solved rows
        const clearedRows = mapHandler.clearFullRows(battleUser.map);
        if (clearedRows) {
          battleUser.rows = increment.rows = battleUser.rows + clearedRows;
          battleUser.mana = increment.mana = battleUser.mana + (clearedRows * 5);

          // add rows to the bottom of all oponents, when more than one line was removed
          const userKeys = Object.keys(this.users).filter(userKey => userKey !== connectionId);
          for (let i = 0; i < (clearedRows - 1); i++) {
            // create a filled row that should be added to the others
            const emptyRow = [ ];
            for (let i = 0; i < 10; i++) {
              emptyRow.push({ type: -2 });
            }
            // clear one column
            emptyRow[Math.ceil(Math.random() * 10)] = null;
            userKeys.forEach(userKey => {
              // add the new row and remove the first row
              this.users[userKey].map.push(emptyRow);
              this.users[userKey].map.splice(0, 1);
            });
          }
        }

        // update the map[]
        increment.map = battleUser.map;

        // set the next block to display for the current user
        this.setNextBlock(connectionId);
        increment.activeBlock = battleUser.activeBlock;

        break;
      }
    }

    // until now, we worked on a activeBlock copy, at this point everything is fine, apply latest
    // activeBlock to the user
    if (increment.activeBlock) {
      battleUser.activeBlock = increment.activeBlock;
    }

    // send update
    await api.chatRoom.broadcast({}, this.roomName, {
      type: 'battle-increment',
      battle: {
        status: this.status,
        users: users,
      },
    });
  }
}
