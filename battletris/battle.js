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
    const type = Math.floor(Math.random() * 6);

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

    // current joined users, their status, active blocks, effects, ...
    this.users = { };

    // used to handle setTimeout calls to prevent circular references in users object
    this.timeouts = { };

    // set initial structur for map and so on
    this.initialize();
  }

  /**
   * Adds a row to a map.
   *
   * @param      {Array<Arra<any>>}  map     user map
   */
  addFilledRowToMap(map) {
    const emptyRow = { type: -2 };

    // pushes new line
    map.push(mapHandler.generateRandomClears(
      [[
        emptyRow, emptyRow, emptyRow, emptyRow, emptyRow,
        emptyRow, emptyRow, emptyRow, emptyRow, emptyRow
      ]],
      1
    )[0]);
    // remove the first line
    map.splice(0, 1);
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

          // start the armor damage / heal ability for the target user
          this.executeAbility(
            'battletris',
            changed.targetId,
            // if user activated ability on his self, start the specific repair ability, else start
            // the damage ability
            changed.targetId === changed.connectionId ? clearedRows - 1 : 3 + clearedRows,
          );
        }

        // set the next block to display for the current user
        this.setNextBlock(connectionId);

        break;
      }
    }
  }

  /**
   * Starts a effect loop for specific class and ability.
   *
   * @param      {any}  executor      battle user that executes the ability
   * @param      {any}  target        battle user target
   * @param      {any}  abilityIndex  ability of that the effect should be started
   * @param      {any}  payload       optional payload that should be passed into the ability
   *                                  execute function
   */
  effectLoop(executor, target, abilityIndex, payload) {
    const effectId = `effect.${ executor.className }.${ abilityIndex }`;
    const ability = classes[executor.className][abilityIndex];
    const existingEffect = target.effects
      .filter(effect =>
        effect.className === executor.className &&
        effect.abilityIndex == abilityIndex
      )[0];
    const effect = existingEffect || _.clone(ability.effect);

    // if effect is already running, increase effect duration
    if (existingEffect) {
      effect.duration += ability.effect.duration;
      this.clearTimeout(target.connectionId, effectId);
    } else {
      // specify start time and identifiers
      effect.start = Date.now();
      effect.className = executor.className;
      effect.abilityIndex = abilityIndex;
      effect.stack = 1;
      // push it to the target effects
      target.effects.push(effect);
    }

    // is called until the effect 
    const runEffect = () => {
      // check if effect is expired
      if ((effect.start + effect.duration) <= Date.now()) {
        delete target.effects.splice(target.effects.indexOf(effect), 1);
      } else {
        // reduce the stack count
        effect.stack = Math.round(effect.duration / ability.duration);

        // run the ability
        ability.execute.call(ability, this, executor, target, payload);

        // start next the next call
        this.setTimeout(target.connectionId, effectId, runEffect, effect.timeout);
      }

      this.sendBattleIncrement();
    };

      // start the effect loop
    if (effect.type === 'delayed') {
      this.setTimeout(target.connectionId, effectId, runEffect, effect.timeout);
    } else {
      runEffect();
    }
  }

  /**
   * Executes a ability for a specific user
   *
   * @param      {any}     executorId    connection id for the user that executes the ability
   * @param      {any}     targetId      connection id of the target
   * @param      {number}  abilityIndex  0 - 3, index of the ability that should be executed
   * @param      {any}     payload       optional payload that should be passed into the ability
   *                                     execute function
   */
  executeAbility(executorId, targetId, abilityIndex, payload) {
    // side load faked battletris user, to activate game abilities
    let executor = executorId === 'battletris' ?
      { className: 'battletris', connectionId: 'battletris', cooldowns: { }, mana: 100, } :
      this.users[executorId];
    const ability = classes[executor.className][abilityIndex];

    // if the ability was not implemented or the user has not enough mana, just reject the action
    if (
      // ability not found
      !ability ||
      // not enough mana
      (executor.mana - ability.costs) < 0 ||
      // cooldown is active
      executor.cooldowns[abilityIndex]
    ) {
      return;
    // else, call the ability
    } else {
      // reduce mana of current player
      executor.mana -= ability.costs;

      // lock the ability for 
      if (ability.cooldown) {
        // start the cooldown by setting the expiration time to the cooldowns object
        executor.cooldowns[abilityIndex] = Date.now() + ability.cooldown;
        
        // unlock the cooldown after X milliseconds
        this.setTimeout(executorId, `cooldown.${ abilityIndex }`, () => {
          delete executor.cooldowns[abilityIndex];
          this.sendBattleIncrement();
        }, ability.cooldown);
      }

      // start the effect loop
      if (ability.effect) {
        this.effectLoop(executor, this.users[targetId], abilityIndex, payload);
      } else {
        // execute ability directly, if no effect should be applied
        ability.execute.call(ability, this, executor, this.users[targetId], payload);
        this.sendBattleIncrement();
      }
    }
  }

  /**
   * Deep diff between two object, using lodash (https://gist.github.com/Yimiprod/7ee176597fef230d1451)
   * @param  {Object} object Object compared
   * @param  {Object} base   Object to compare with
   * @return {Object}        Return a new object who represent the diff
   */
  getDifference(object = { }, base = { }) {
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
  }

  /**
   * Returns the lastest battle status and user updates.
   *
   * @param      {string}   connectionId                 connection id of the user, for that the
   *                                                     last battle update should be returned
   * @param      {boolean}  [updateUserState=true]  automatic update last user status to the
   *                                                     latest state
   * @return     {Object}   status, duration, users.
   */
  getUserStateIncrement(updateUserState = true) {
    const increment = {
      status: this.status,
      duration: this.duration,
      users: this.getDifference(this.users, this.userStates),
    };

    // save latest version of the users status, so each user has his own update stack that can
    // be send directly after an action
    if (updateUserState) {
      this.userStates = _.cloneDeep(this.users);
    }

    return increment;
  }

  /**
   * Transforms the battle data into an json object, so we will not try to send object instances to
   * the ui.
   */
  getJSON() {
    const jsonResult = { };
    [
      'config', 'duration', 'roomName', 'startCounter', 'startTime',
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
    this.userStates = { };
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

    // when armor gets damaged to zero, the add line ability is called
    user.armor = 100;
    // block turn (press up)
    user.blockIndex = -1;
    // connection id
    user.connectionId = connectionId;
    // locked abilities for a specific time
    user.cooldowns = [ ];
    // buffs / debuffs
    user.effects = [ ];
    // current speed level
    user.level = 1;
    // users full map
    user.map = map;
    // amount of mana
    user.mana = 0;
    // cleared rows
    user.rows = 0;
    // keep old status of the user (open, joined, accepted, lost, won)
    user.status = user.status || 'open';
    // users speed
    user.userSpeed = this.config.userSpeed;
    // target connection id for applying abilities and block resolvles
    user.targetId = connectionId;

    // apply the user to the battle
    this.users[connectionId] = user;

    // clear previous active block, so a old one does not will be displayed during start a new game
    // set it to an empty array to force reloading
    this.setNextBlock(connectionId);

    this.log(`user joined battle ${ connectionId }`);
  }

  /**
   * Just remove a connection from the users object.
   *
   * @param      {string}  connectionId  the connection id that should be removed
   */
  leave(connectionId) {
    if (this.users[connectionId]) {
      // clear user loop timeout
      Object.keys(this.timeouts).forEach((timeoutId) => {
        timeoutId.startsWith(connectionId) && this.clearTimeout(timeoutId);
      });

      // remove user from runtime
      delete this.users[connectionId];
    }

    // if all users have left the game, stop it
    if (Object.keys(this.users).length === 0) {
      this.stop();
    }
  }

  /**
   * Logs in context to this battle.
   */
  log(message, level = 'debug') {
    api.log(`[battletris] [${ this.roomName }]: ${ message }`);
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
   * Send latest changes to the battlefield
   */
  sendBattleIncrement() {
    api.chatRoom.broadcast({}, this.roomName, {
      type: 'battle-increment',
      battle: this.getUserStateIncrement(),
    });
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
        Object.keys(this.users).forEach(connectionId => this.setTimeout(
          connectionId,
          'userLoop',
          () => this.userLoop(connectionId),
          this.users[connectionId].userSpeed
        ));

        // start the game, count time and send latest updates every X seconds
        this.gameLoopInterval = setInterval(
          async () => this.gameLoop(),
          this.config.gameLoopSpeed
        );

        // used to handle increment user battle states, only a diff will be sent to the user after
        // an user action or an userLoop turn
        this.userStates = _.cloneDeep(this.users);

        // update the counter within the UI
        await api.chatRoom.broadcast({}, this.roomName, {
          type: 'battle-increment',
          battle: this.getJSON(),
        });
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
    Object.keys(this.timeouts).forEach((timeoutId) => this.clearTimeout(timeoutId));

    // only save reports, when game was not canceled
    if (Object.keys(this.users).length !== 0) {
      // add data for analysis
      const report = {
        date: Date.now(),
        time: Date.now() - this.startTime,
        room: this.roomName,
      };
      const date = new Date();
      // parse users for analysis report saving in redis 
      report.users = Object.keys(this.users).map((userId) => {
        const battleUser = this.users[userId];
        const userInfo = api.battletris.rooms[this.roomName].users[userId];

        if (battleUser.status === 'won') {
          report.winner = userInfo.name;
        }

        return {
          blockIndex: battleUser.blockIndex,
          className: battleUser.className,
          name: userInfo.name,
          rows: battleUser.rows,
        }
      });

      // push to redis
      api.redis.clients.client.lpush(
        `battletris:${ date.getFullYear() }:${ date.getMonth() }:${ date.getDate() }:${ date.getHours() }`,
        JSON.stringify(report)
      );
    }

    // reset to initial battle values
    this.initialize();

    // send new battle update
    return api.chatRoom.broadcast({}, this.roomName, {
      type: 'battle',
      battle: this.getJSON(),
    });
  }

  /**
   * Runs a setTimeout and maps the reference to the timeouts object, so they can be cleared, when
   * game is stopping or the user lost.
   */
  setTimeout(connectionId, id, func, timeout) {
    // if previous timeout is running, clear it and trigger the new one
    if (this.timeouts[`${ connectionId }${ id }`]) {
      this.clearTimeout(connectionId, id);
    }

    // execute the callback func and register the timeout reference
    this.timeouts[`${ connectionId }${ id }`] = setTimeout(func, timeout);
  }

  /**
   * Removes and stops a timeout from the timeouts object.
   */
  clearTimeout(connectionId, id = '') {
    clearTimeout(this.timeouts[`${ connectionId }${ id }`]);
    delete this.timeouts[`${ connectionId }${ id }`];
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
        // if it's not a 4x4 block, turn it
        // the rotation will be -1 for some abilities, so disable turning
        if (activeBlock.type !== 3 && activeBlock.rotation !== -1) {
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

        // user has changed his target, check if the target for the specific index exists and change
        // it (use 1 to 6 for a better keyboard experience) (keyCode 48 equals to zero) also allow
        // tab as direct targeting yourself
        if ((key > 48 && key < 55) || key === 9) {
          const targetId = key === 9 ? connectionId : Object.keys(this.users)[key - 49];
          if (targetId) {
            currUser.targetId = targetId;
            // send update, but disable collision detection
            delete collisionUsers[connectionId];
            knownKey = true;
          }
        }

        // execute ability, when available
        const abilityIndex = abilityKeys.indexOf(key);
        if (abilityIndex !== -1 && classes[currUser.className][abilityIndex]) {
          knownKey = true;

          // enforce collision check for the target user
          if (!collisionUsers[currUser.targetId]) {
            collisionUsers[currUser.targetId] = _.cloneDeep(this.users[currUser.targetId]);
          }

          // run the users action
          this.executeAbility(
            connectionId,
            currUser.targetId,
            abilityIndex
          );

          knownKey = true;
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
  }

  /**
   * Automated user loop, moves user down, handles next interactions, ...
   *
   * @param      {string}   connectionId     users connection id
   * @param      {boolean}  [initial=false]  disables the automatic block move down user action
   */
  userLoop(connectionId) {
    const user = this.users[connectionId];

    // increase speed every X seconds
    if (this.duration > (this.config.increaseInterval * user.level)) {
      // increase users level to speedup the game after another increaseInterval
      user.level++;
      // reduce the user speed
      user.userSpeed = user.userSpeed - this.config.increaseSteps;
    }

    // if user has not the status lost, run the next
    if (this.status === 'started' &&
        user.status !== 'lost' &&
        user.status !== 'won') {
      // move stone down
      this.userAction(connectionId, 40);
      // send latest data to battle room
      this.sendBattleIncrement();
      // trigger next automated user action
      this.setTimeout(connectionId, 'userLoop', () => this.userLoop(connectionId), user.userSpeed);
    }
  }
}
