const _ = require('lodash');
const blocks = require('./blocks');
const classes = require('./classes');
const mapHandler = require('./mapHandler');
const Mutex = require('async-mutex').Mutex;
const { api, } = require('actionhero');

// keys that sets the active ability
const abilityKeys = [
  81, // q
  87, // w
  69, // e
  82, // r
];

module.exports = class Battle {
  /**
   * Returns a new random block
   *
   * @return     {any}  block definition
   */
  static generateRandomBlock() {
    const type = Math.round(Math.random() * 6);

    return {
      map: _.cloneDeep(blocks[type][0]),
      rotation: 0,
      type,
      x: 3,
      // the block map for the long block and the square, starting with an empty zero row
      y: type === 0 || type === 3 ? -1 : 0,
    };
  }

  constructor(roomName) {
    this.roomName = roomName;
    this.users = { };

    // used to handle setTimeout calls to prevent circular references in users object
    this.timeouts = { };

    // set initial structur for map and so on
    this.initialize();
  }

  /**
   * Gets the previous battle user object and the changed battle user object and check for
   * collisions.
   *
   * @param      {any}     origin   original battle user (used for action revert)
   * @param      {any}     changed  changed battle user
   * @param      {number}  key      action key that was used to move the current field
   * @return     {vooid}  resolved when done
   */
  collisionDetection(origin, changed, key) {
    const activeBlock = changed.activeBlock;
    const connectionId = changed.connectionId;
    const originBlock = origin.activeBlock;
    // check if the action can be performed
    let collision = mapHandler.checkForCollision(changed.map, activeBlock, origin.activeBlock);
    switch (collision) {
      // if the stone movement was invalid, stop it!
      // if it was a spin and it would spin out of the map, move it to the correct position
      case 'invalid': {
        if (key === 38) {
          if (activeBlock.x < 0) {
            activeBlock.x = 0;
            collision = mapHandler.checkForCollision(changed.map, activeBlock, origin.activeBlock);
            break;
          } else if (activeBlock.x + activeBlock.map[0].length >= 9) {
            activeBlock.x = 10 - activeBlock.map[0].length;
            collision = mapHandler.checkForCollision(changed.map, activeBlock, origin.activeBlock);
            break;
          } else {
            // reset activeBlock changes and return
            changed.activeBlock = origin.activeBlock;
            return;
          }
        } else {
          // reset activeBlock changes and return
          changed.activeBlock = origin.activeBlock;
          return;
        }
      }
      // dock the activeBlock to the map and generate a new activeBlock
      case 'docked': {
        // IMPORTANT: use the origin.activeBlock, before the navigation was performed
        for (let y = 0; y < originBlock.map.length; y++) {
          for (let x = 0; x < originBlock.map[y].length; x++) {
            if (originBlock.map[y][x]) {
              if (originBlock.y + y === 0) {
                changed.status = 'lost';
                break;
              } else {
                changed.map[originBlock.y + y][originBlock.x + x] = {
                  type: originBlock.type,
                };
              }
            }
          }

          // just break the for loop and check for a winner
          if (changed.status === 'lost') {
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
        const clearedRows = mapHandler.clearFullRows(changed.map);
        if (clearedRows) {
          changed.rows = changed.rows + clearedRows;
          
          // increase mana
          const mana = changed.mana + (clearedRows * 5);
          changed.mana = mana > 100 ? 100 : mana;

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

          // TODO: check if anyone has lost after new lines where stacked at the bottom
        }

        // set the next block to display for the current user
        this.setNextBlock(connectionId);

        break;
      }
    }
  }

  /**
   * Executes a ability for a specific user
   *
   * @param      {any}     executorId    connection id for the user that executes the ability
   * @param      {any}     targetId      connection id of the target
   * @param      {number}  abilityIndex  0 - 3, index of the ability that should be executed
   */
  executeAbility(executorId, targetId, abilityIndex) {
    const executor = this.users[executorId];
    const ability = classes[executor.className][abilityIndex];

    if (!ability || (executor.mana - ability.config.costs) < 0) {
      return;
    } else {
      const config = ability.config;
      const target = this.users[targetId];

      // reduce mana costs
      executor.mana -= config.costs;

      // copy the map, so the original once will not be adjusted
      const abilityMap = _.cloneDeep(config.map === 'activeBlock' ? executor.activeBlock : config.map);
      // check for fully filled rows, clear random columns
      abilityMap.forEach(row => {
        if (row.length === 10 && row.filter(col => !!col)) {
          row[Math.ceil(Math.random() * 10)] = null;
        }

        // replace all set columns with the correct fill type
        row.forEach(col => col = col ? { type: -2 } : 0);
      });

      // check for automatic position detection
      const pos = config.pos;
      if (pos && pos.type) {
        if (pos.type === 'free') {
          // TODO: insert correct field detection
          pos.x = pos.x || 0;
          pos.y = pos.y || 0;
        } else if (pos.type === 'blocked') {
          // TODO: insert correct field detection
          pos.x = pos.x || 0;
          pos.y = pos.y || 0;
        } else {
          pos.x = pos.x || 0;
          pos.y = pos.y || 0;
        }
      }

      switch (ability.type) {
        // add all lines with the configured map at the configured position
        case 'insert-lines': {
          target.map.splice(pos.y, 0, ...abilityMap);
          target.map.splice(0, abilityMap.length);

          break;
        }
        // add lines into the y range
        case 'remove-lines': {
          target.map.splice(pos.y - abilityMap.length, abilityMap.length);
          target.map.splice(0, 0, ...(mapHandler.generateEmptyRows(abilityMap.length)));

          break;
        }
        // clears everything in range
        case 'clear': {
          break;
        }
        // adds a line to range
        case 'fill': {
          break;
        }
      }
    }

    // TODO: check if anyone has lost after new lines where stacked at the bottom
  }

  /**
   * Deep diff between two object, using lodash (https://gist.github.com/Yimiprod/7ee176597fef230d1451)
   * @param  {Object} object Object compared
   * @param  {Object} base   Object to compare with
   * @return {Object}        Return a new object who represent the diff
   */
  getDifference(object, base) {
    function changes(object, base) {
      return _.transform(object, function(result, value, key) {
        if (!_.isEqual(value, base[key])) {
          // IMPORTANT: do not detect differences in arrays, it will break the full map / block
          // logic
          result[key] = (_.isObject(value) && _.isObject(base[key]) && !Array.isArray(value)) ?
            changes(value, base[key]) :
            value;
        }
      });
    }
    return changes(object, base);
  }

  /**
   * Handle overhaul interactions.
   */
  gameLoop() {
    // set general data
    this.duration = Date.now() - this.startTime;

    // send the battle updates
    api.chatRoom.broadcast({}, this.roomName, {
      type: 'battle-increment',
      battle: this.getLastBattleUpdate(),
    });

    // clear the last changes
    this.lastUserStatus = _.cloneDeep(this.users);
  }

  /**
   * Returns the lastest battle status and user updates.
   *
   * @param      {any}     [lastUserStatus=this.lastUserStatus]  last users status object to
   *                                                             generate the diff, default is from
   *                                                             instance
   * @return     {Object}  status, duration, users.
   */
  getLastBattleUpdate(lastUserStatus = this.lastUserStatus) {
    return {
      status: this.status,
      duration: this.duration,
      users: this.getDifference(this.users, lastUserStatus),
    };
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
   * Set initial values for the battle, without resetting the users
   */
  initialize() {
    this.blocks = [ ];
    this.config = _.cloneDeep(api.config.battletris);
    this.duration = 0;
    this.lastUserStatus = _.cloneDeep(this.users);
    this.startCounter = this.config.startCounter;
    this.startTime = 0;
    this.status = 'open';
    this.time = 0;
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
    user.userSpeed = this.config.userSpeed;
    // index of the active ability
    user.abilityIndex = 0;

    // apply the user to the battle
    this.users[connectionId] = user;

    // clear previous active block, so a old one does not will be displayed during start a new game
    // set it to an empty array to force reloading
    this.setNextBlock(connectionId);
  }

  /**
   * Just remove a connection from the users object.
   *
   * @param      {string}  connectionId  the connection id that should be removed
   */
  leave(connectionId) {
    if (this.users[connectionId]) {
      // clear user loop timeout
      clearTimeout(this.timeouts[connectionId]);
      // remove user from runtime
      delete this.users[connectionId];
      delete this.timeouts[connectionId];
    }

    // if all users have left the game, stop it
    if (Object.keys(this.users).length === 0) {
      this.stop();
    }
  }

  /**
   * Returns the newly generated next active block for a specific user.
   */
  setNextBlock(connectionId) {
    const currUser = this.users[connectionId];

    // increase block index
    currUser.blockIndex++;

    // generate new blocks
    if (!this.blocks[currUser.blockIndex]) {
      this.blocks.push(Battle.generateRandomBlock());
    }

    // generate next block
    if (!this.blocks[currUser.blockIndex + 1]) {
      this.blocks.push(Battle.generateRandomBlock());
    }

    // set active block
    currUser.activeBlock = _.cloneDeep(this.blocks[currUser.blockIndex]);
    currUser.nextBlock = _.cloneDeep(this.blocks[currUser.blockIndex + 1]);
  }

  /**
   * Start the runtime interval.
   */
  async start() {
    this.status = 'starting';

    // reset latest user values
    Object.keys(this.users).forEach(userId => {
      this.join(userId, this.users[userId]);

      // brand className when the user has joined, so it can be changed later
      this.users[userId].className = api.battletris.rooms[this.roomName].users[userId].className;
    });

    // wait for 10 seconds until starting the game
    this.startingLoopInterval = setInterval(async () => {
      this.startCounter = this.startCounter - 1;

      // clear the starting interval and start the game loop
      if (this.startCounter === 0) {
        this.status = 'started';
        this.startTime = Date.now();

        // clear all previous loops (also clear game loop, to prent bugs in runtime)
        clearInterval(this.startingLoopInterval);
        clearInterval(this.gameLoopInterval);

        // start auomated user actions
        Object.keys(this.users).forEach(connectionId => {
          this.userLoop(connectionId, true);
        });

        // start the game, count time and send latest updates every X seconds
        this.gameLoopInterval = setInterval(
          async () => this.gameLoop(),
          this.config.gameLoopSpeed
        );

        // update the counter within the UI
        await api.chatRoom.broadcast({}, this.roomName, {
          type: 'battle-increment',
          battle: this.getJSON(),
        });

        this.lastUserStatus = _.cloneDeep(this.users);
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
    // clear gamme loop intervals 
    clearInterval(this.startingLoopInterval);
    clearInterval(this.gameLoopInterval);
    // clear user loop intervals
    Object.keys(this.users).forEach(connectionId =>
      clearTimeout(this.users[connectionId].loopTimeout));

    // reset to initial battle values
    this.initialize();

    // send new battle update
    return api.chatRoom.broadcast({}, this.roomName, {
      type: 'battle',
      battle: this.getJSON(),
    });
  }

  /**
   * Handles a user action
   *
   * @param      {string}   connectionId  users connection id
   * @param      {number}   key           number key
   * @return     {Promise}  void
   */
  userAction(connectionId, key) {
    // cancel action when a wrong connection id was passed
    if (!this.users[connectionId]) {
      return;
    }

    // fast access for current user
    const currUser = this.users[connectionId];
    let activeBlock = currUser.activeBlock;
    // backup current user, so we can roll back latest changes
    const currUserOrigin = _.cloneDeep(currUser);
    // only send updates back to the current user, that have changed during this function call
    const lastUserStatus = _.cloneDeep(this.users);
    // save original user objects as backups, so collision detection can retract last actions
    let collisionUsers = {
      [ connectionId ]: currUserOrigin
    };

    switch (key) {
      // left
      case 37: {
        activeBlock.x--;
        break;
      }
      // up
      case 38: {
        // if it's not a block, turn it
        if (activeBlock.type !== 3) {
          activeBlock.rotation = activeBlock.rotation === 3 ? 0 : activeBlock.rotation + 1;
          activeBlock.map = blocks[activeBlock.type][activeBlock.rotation];
        }
        break;
      }
      // right
      case 39: {
        activeBlock.x++;
        break;
      }
      // down
      case 40: {
        activeBlock.y++;
        // just skip next gameloop auto move down
        currUser.skipAutoMove = true;
        break;
      }
      // press space
      case 32: {
        // move the original block to the next dock position
        currUserOrigin.activeBlock = mapHandler.getDockPreview(currUser.map, activeBlock);
        // assign the new original block to the current currUser active block position, so the
        // collision logic will render this block as docked
        currUser.activeBlock = activeBlock = _.cloneDeep(currUserOrigin.activeBlock);
        // after this, increase the y position by one, so a collision will be generated
        activeBlock.y++;
        break;
      }
      default: {
        let knownKey = false;

        // if user pressed a ability activation key, it will be set active
        const abilityIndex = abilityKeys.indexOf(key);
        if (abilityIndex !== -1 && classes[currUser.className][abilityIndex]) {
          currUser.abilityIndex = abilityIndex;
          // send update, but disable collision detection
          delete collisionUsers[connectionId];
          knownKey = true;
        }

        // ability should be activated (use 1 to 6 for a better keyboard experience) (keyCode 48
        // equals to zero) also allow tab as direct key for self cast
        if ((key > 48 && key < 55) || key === 9) {
          const targetConnectionId = key === 9 ? connectionId : Object.keys(this.users)[key - 49];
          if (targetConnectionId) {
            // enforce collision check for the target user
            if (!collisionUsers[targetConnectionId]) {
              collisionUsers[targetConnectionId] = _.cloneDeep(this.users[targetConnectionId]);
            }

            // run the users action
            this.executeAbility(
              connectionId,
              targetConnectionId,
              currUser.abilityIndex
            );

            knownKey = true;
          }
        }

        // just return on invalid input
        if (!knownKey) {
          return;
        }
      }
    }

    // check collisions for all corresponding users
    Object.keys(collisionUsers).forEach(collisionUserId =>
      this.collisionDetection(
        collisionUsers[collisionUserId],
        this.users[collisionUserId],
        // TODO: also check spin for other players, when a ablity exists, that turns blocks from
        // other players?
        collisionUserId === connectionId ? key : false
      )
    );

    // return last battle update, so the user gets updated directly
    return this.getLastBattleUpdate(lastUserStatus);
  }

  /**
   * Automated user loop, moves user down, handles next interactions, ...
   *
   * @param      {string}   connectionId     users connection id
   * @param      {boolean}  [initial=false]  disables the automatic block move down user action
   */
  userLoop(connectionId, initial = false) {
    const user = this.users[connectionId];

    // increase speed every X seconds
    if ((this.duration % this.config.increaseInterval) === 0) {
      // reduce the user speed
      user.userSpeed = user.userSpeed - this.config.increaseSteps;
    }

    // if user has not the status lost, run the next 
    if (this.status === 'started' &&
        user.status !== 'lost' &&
        user.status !== 'won') {
      // move block down, if the user does not used the down key
      // if (!initial && !user.skipAutoMove) {
      if (!initial) {
        this.userAction(connectionId, 40);
      }

      // trigger next automated user action 
      this.timeouts[connectionId] = setTimeout(() => this.userLoop(connectionId), user.userSpeed);
    }

    delete user.skipAutoMove;
  }
}
