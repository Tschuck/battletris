const classes = require('./classes');

// keys that sets the active ability
const abilityKeys = [ 'q', 'w', 'e', 'r' ];

/**
 * Executes a ability for a specific user
 *
 * @param      {any}     executor      battle user object for the user that executes the ability
 * @param      {any}     target        battle user object of the target
 * @param      {number}  abilityIndex  0 - 3, index of the ability that should be executed
 */
const executeAbility = function(executor, target, abilityIndex) {
  const ability = classes[executor.className][abilityIndex];
  const config = ability.config;

  // copy the map, so the original once will not be adjusted
  const abilityMap = JSON.parse(JSON.stringify(
    config.map === 'activeBlock' ? executor.activeBlock : config.map
  ));
  // check for fully filled rows, clear random columns
  abilityMap.forEach(row => {
    if (row.length === 9 && row.filter(col => !!col)) {
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
      target.map.splice(pos.y, 0, abilityMap);
      target.map.splice(0, abilityMap.length);

      break;
    }
    // add lines into the y range
    case 'remove-lines': {
      target.map.splice(pos.y, abilityMap.length);
      target.map.splice(0, 0, new Array(abilityMap.length));

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

  return {
    exectur,
    target,
  }
}

module.exports = {
  abilityKeys,
  executeAbility,
}