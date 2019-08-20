const mapHandler = require('./mapHandler');

module.exports = {
  unkown: [
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
        target.activeBlock = {
          map: [
            [ 0, 0, 1, 0, 0, 1, 0, 0, ],
            [ 0, 1, 1, 1, 1, 1, 1, 0, ],
            [ 1, 0, 0, 1, 1, 0, 0, 1, ],
            [ 0, 0, 1, 1, 1, 1, 0, 0, ],
          ],
          rotation: -1,
          type: -2,
          x: 1,
          y: 0,
        };
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
