const mapHandler = require('./mapHandler');

module.exports = {
  unkown: [
    // clear line
    {
      costs: 20,
      execute: (executor, target) => {
        target.map.pop();
        target.map.unshift(mapHandler.generateEmptyRows(1)[0]);
      }
    },
    // add line
    {
      costs: 20,
      execute: (executor, target) => {
        target.map.push(mapHandler.generateRandomClears([ [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ] ], 1)[0]);
        target.map.splice(0, 1);
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
