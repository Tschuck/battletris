const _ = require('lodash');

/**
 * Checks for block collisions and detects, if a stone gets docked to the bottom or to another
 * stone.
 *
 * @param      {Array<Array<any>>}  map            map definition (20x10)
 * @param      {Array<Array<any>>}  activeBlock    active block map
 * @param      {Array<Array<any>>}  originalBlock  block before it was moved
 * @return     {(boolean|string)}   false for no collision, invalid for collision, docked for docked
 *                                  to another stone
 */
function checkForCollision(map, activeBlock, originalBlock) {
  // disabled docking when x hash changed, it would dock stones on horizontal blocks
  const detectDocking = !originalBlock ||
    (
      activeBlock.x === originalBlock.x &&
      _.isEqual(activeBlock.map, originalBlock.map)
    );

  // iterate through the activeBlock map
  for (let y = 0; y < activeBlock.map.length; y++) {
    for (let x = 0; x < activeBlock.map[y].length; x++) {
      // skip empty blocks
      if (activeBlock.map[y][x]) {
        // only detect docking when y was moved, but not the x axes
        if (detectDocking) {
          // user has reached the ground
          if (y + activeBlock.y === 20) {
            return 'docked';
          }

          // check for y collision, the block will be attached on top
          if (map[activeBlock.y + y] && map[activeBlock.y + y][activeBlock.x + x]) {
            return 'docked';
          }
        } else {
          if (map[activeBlock.y + y] && map[activeBlock.y + y][activeBlock.x + x]) {
            return 'invalid';
          }
        }

        // active block is moved out of the left screen
        if (x + activeBlock.x < 0) {
          return 'invalid';
        }

        // active block is moved out of the right screen
        if (x + activeBlock.x > 9) {
          return 'invalid';
        }
      }
    }
  }

  return false;
}

/**
 * Detect full rows, removes them, adds more empty lines at top and returns the amount of cleared
 * rows.
 *
 * @param      {Array<Array<any>>}  map     map definition (20x10)
 */
function clearFullRows(map) {
  let counter = 0;

  for (let y = map.length -1; y > -1; y--) {
    // check if all cols are filled in a row
    if (map[y].filter(col => !col).length === 0) {
      // increase the counter
      counter++;
      // remove the row
      map.splice(y, 1);
      // add a new one
      map.unshift([...Array(10)]);
      // check the new last row again
      y++;
    }
  }

  return counter;
}

/**
 * Try to detect the next dock position, where the active block can be docked to.
 *
 * @param      {Array<Array<any>>}  map          map definition (20x10)
 * @param      {Array<Array<any>>}  activeBlock  active block map
 * @return     {activeBlock}             the block moved to the next docked position
 */
function getDockPreview(map, activeBlock) {
  const blockCopy = JSON.parse(JSON.stringify(activeBlock));
  let docked;

  // move block down until it reached a dock point
  while (!docked) {
    blockCopy.y++;
    docked = checkForCollision(map, blockCopy) === 'docked';
  }

  // reduce blockCopy y value by one, so the last previous position without any collision
  blockCopy.y--;
  return blockCopy;
}

module.exports = {
  checkForCollision,
  clearFullRows,
  getDockPreview,
};