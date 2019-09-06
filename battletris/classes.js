const mapHandler = require('./mapHandler');

const sampleAbility = {
  // mana costs
  costs: 0,
  // effect will start a loop, that is called in the timeout interval until the duration is reached
  effect: {
    // effect duration in ms, after this time, the effect will be removed
    duration: 5 * 1000,
    // ability will be locked for X ms after activation
    cooldown: 10 * 1000,
    // timeout until the execute function is called again (can be undefined, so the timeout will be duration)
    timeout: 175,
    // direct => run the execute function directly
    // delayed => run the execute function after first timeout
    type: 'delayed',
  },
  // function that is called to activate the ability
  ///  - will called once, when effect is empty
  //   - will called multiple times, when effect is available
  execute: (battle, executor, target, payload) => {
    // do what you want
  },
  // Will be exeucted by retrieving the users speed
  getUserSpeed: (battle, args) => {
    const [ connectionId, ] = args;
    args.push(battle.users[connectionId].userSpeed + 100);
  },
  // Will be executed, when the block of a user is technically moved down (not userAction)
  moveBlockDown: (battle, args) => {
    const [ connectionId, ] = args;

    // cancel block down
    return false;
  },
  // User action hook that will be runned before a userAction is runned. Args can be adjusted
  // (original userAction params = connectionId, key, keyPressed)
  userAction: (battle, args) => {
    const [ connectionId, key, keyPressed ] = args;
    
    // adjust pressed key
    args[1] = 40;
    
    // adjust connection
    args[0] = '....'
    
    // return cancel the user Action, return true / undefined to run the user action
    return true / false;
  },
}

/**
 * Depending on how many rows were solved, one of the first 4 abilities of the battletris class will
 * be activated.
 *
 * @return     {any}  Battle armor ability
 */
const getBattletrisArmorFunc = (type, clearedRows) => {
  const ability = {
    costs: 0,
    effect: {
      duration: 6 * 1000,
      timeout: 1000,
      type: 'delayed'
    },
  };

  // 20 * 1 = 20 x (1 x 1) = 20
  // 20 * 2 = 40 x (1 x 2) = 80
  // 20 * 3 = 60 x (1 x 3) = 180
  // 20 * 4 = 80 x (1 x 4) = 320
  //   => also divide the damage with times, the execute function is called
  const damage = (20 * clearedRows * clearedRows) / (ability.effect.duration / 1000);

  // 5 * 1 = 5 x (1 x 1) = 5
  // 5 * 2 = 10 x (1 x 2) = 10
  // 5 * 3 = 15 x (1 x 3) = 36
  // 5 * 4 = 20 x (1 x 5) = 64
  //   => also divide the heal with times, the execute function is called
  const heal = (5 * clearedRows * clearedRows) / (ability.effect.duration / 1000);

  // repair your armor
  if (type === 0) {
    ability.execute = (battle, executor, target) => {
      target.armor += heal;

      // if armor level is higher than 100, cap it
      if (target.armor > 100) {
        target.armor = 100;
      }
    };
  } else {
    // damage your armor
    ability.execute = (battle, executor, target) => {
      target.armor -= damage;

      // if armor is decreased under zero, add a line to the bottom
      if (target.armor <= 0) {
        battle.addFilledRowToMap(target.map);
        target.armor = 100;
      }
    };
  }

  return ability;
};

module.exports = {
  battletris: [
    // seperate the abilities for battletris, so each type will have it's own icon and description
    // repair your armor
    getBattletrisArmorFunc(0, 1),
    getBattletrisArmorFunc(0, 2),
    getBattletrisArmorFunc(0, 3),
    getBattletrisArmorFunc(0, 4),
    // damage the armor
    getBattletrisArmorFunc(1, 1),
    getBattletrisArmorFunc(1, 2),
    getBattletrisArmorFunc(1, 3),
    getBattletrisArmorFunc(1, 4),
  ],
  unknown: [
    // clear line
    {
      costs: 20,
      execute: (battle, executor, target) => {
        target.map.pop();
        target.map.unshift(mapHandler.generateEmptyRows(1)[0]);
      }
    },
    // add line
    {
      costs: 20,
      execute: (battle, executor, target) => {
        target.map.push(mapHandler.generateRandomClears([ [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ] ], 1)[0]);
        target.map.splice(0, 1);
      },
    },
    // rotate stone, lock space, move down and turn
    {
      costs: 50,
      effect: {
        duration: 10 * 1000,
        timeout: 175,
      },
      execute: (battle, executor, target) => {
        battle.userAction(target.connectionId, 38);
      },
    },
    // replaces the activeBlock of an enemy with an giant block
    {
      costs: 100,
      execute: (battle, executor, target) => {
        battle.setNextBlock(target.connectionId, {
          map: [
            [ 1, 1, 1, 0, 1, 0, 1, 0, ],
            [ 1, 0, 1, 0, 1, 0, 1, 1, ],
            [ 1, 1, 1, 0, 1, 1, 1, 0, ],
          ],
          rotation: -1,
          type: -2,
          x: 0,
          y: 0,
        });
      },
    },
  ],
  sorcerer: [
    // drop current block
    {
      costs: 35,
      execute: (battle, executor, target) => {
        battle.userAction(target.connectionId, 32);
      }
    },
    // increase drop speed
    {
      costs: 50,
      effect: {
        duration: 15 * 1000,
      },
      getUserSpeed: (battle, args) => {
        const [ connectionId, key, keyPressed ] = args;

        if (battle.users[connectionId].userSpeed < 300) {
          args.push(battle.users[connectionId].userSpeed / 2);
        } else {
          args.push(200);
        }
      },
    },
    // reverse controls
    {
      costs: 70,
      effect: {
        duration: 10 * 1000,
      },
      userAction: (battle, args) => {
        const [ connectionId, key, keyPressed ] = args;
        
        // adjust pressed key
        switch (args[1]) {
          case 37: {
            args[1] = 39;
            break;
          }
          case 39: {
            args[1] = 37;
            break;
          }
          case 38: {
            args[1] = 40;
            break;
          }
          case 40: {
            args[1] = 38;
            break;
          }
        }
        return true;
      },
    },
    // prevent target controls
    {
      costs: 80,
      effect: {
        duration: 10 * 1000,
      },
      userAction: (battle, args) => {
        args[1] = 'none'; // invalid input, defaults to nothing --> 'frozen controls'
        return true;
      },
    },
  ],
  warrior: [
    // use own block, replace target block with yours, skip to your next block
    {
      costs: 25,
      execute: (battle, executor, target) => {
        if (executor.activeBlock.type < 0) {
          if (executor.mana < 40) {
            executor.mana += 10;
            return;
          } else {
            executor.mana -= 40;
          }
        }
        target.activeBlock.map = executor.activeBlock.map;
        target.activeBlock.type = executor.activeBlock.type;
        executor.activeBlock = executor.nextBlock;
        battle.setNextBlock(executor.connectionId)
      }
    },
    // smash 2x2 square randomly, this may or may not help your enemy...
    {
      costs: 25,
      execute: (battle, executor, target) => {
        target.map = mapHandler.generateRandomAreaClear([[1, 1], [1, 1]], target.map);
      }
    },
    // slash diagonally from top left to bottom right corner
    {
      costs: 75,
      execute: (battle, executor, target) => {
        let xIndex = 0;
        target.map.forEach((y, yIndex) => {
          if (!(yIndex % 2) && yIndex) {
            xIndex++;
          }
          target.map[yIndex][xIndex] = undefined;
        })
      }
    },
    // gravity effect, fill gaps if block is above
    {
      costs: 100,
      execute: (battle, executor, target) => {
        target.map = mapHandler.flattenMap(target.map);
      }
    },
  ],
};
