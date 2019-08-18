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
      cooldown: 10 * 1000,
      costs: 30,
      effect: {
        duration: 5 * 1000,
        timeout: 100,
      },
      execute: (battle, executor, target) => {
        battle.userAction(target.connectionId, 38);
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
