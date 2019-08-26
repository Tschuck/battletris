const mapHandler = require('./mapHandler');

// {
//   // mana costs
//   costs: 0,
//   // effect will start a loop, that is called in the timeout interval until the duration is reached
//   effect: {
//     // effect duration in ms, after this time, the effect will be removed
//     duration: 5 * 1000,
//     // ability will be locked for X ms after activation
//     cooldown: 10 * 1000,
//     // timeout until the execute function is called again
//     timeout: 175,
//     // direct => run the execute function directly
//     // delayed => run the execute function after first timeout
//     type: 'delayed',
//   },
//   // function that is called to activate the ability
//   ///  - will called once, when effect is empty
//   //   - will called multiple times, when effect is available
//   execute: (battle, executor, target, payload) => {
//     ...
//   }
// }

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

  // 10 * 1 = 10 x (1 x 1) = 10
  // 10 * 2 = 20 x (1 x 2) = 40
  // 10 * 3 = 30 x (1 x 3) = 90
  // 10 * 4 = 40 x (1 x 4) = 120
  //   => also divide the damage with times, the execute function is called
  const damage = (15 * clearedRows * clearedRows) / (ability.effect.duration / 1000);

  // 4 * 1 = 4 x (1 x 1) = 4
  // 4 * 2 = 8 x (1 x 2) = 16
  // 4 * 3 = 12 x (1 x 3) = 36
  // 4 * 4 = 16 x (1 x 4) = 64
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
      costs: 80,
      execute: (battle, executor, target) => {
        battle.setNextBlock(target.connectionId, {
          map: [
            [ 0, 0, 1, 0, 1, 0, 0, ],
            [ 0, 1, 0, 1, 0, 1, 0, ],
            [ 1, 0, 0, 0, 0, 0, 1, ],
          ],
          rotation: -1,
          type: -2,
          x: 1,
          y: 0,
        });
      },
    },
  ],
  rouge: [
  ],
  warlord: [
  ],
  warrior: [
  ],
  wizard: [
  ],
};
