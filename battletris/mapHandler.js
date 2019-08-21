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
  for (let y = activeBlock.map.length - 1; y !== -1; y--) {
    for (let x = 0; x < activeBlock.map[y].length; x++) {
      // skip empty blocks
      if (activeBlock.map[y][x]) {
        // only detect docking when y was moved, but not the x axes
        if (detectDocking) {
          // user have spinned a stone directly on the ground
          if (y + activeBlock.y > 20) {
            return 'invalid-y';
          // user has reached the ground
          } else if (y + activeBlock.y === 20) {
            return 'docked';
          }

          // check for y collision, the block will be attached on top
          if (map[activeBlock.y + y] && map[activeBlock.y + y][activeBlock.x + x]) {
            return 'docked';
          }
        } else {
          if (map[activeBlock.y + y] && map[activeBlock.y + y][activeBlock.x + x]) {
            return 'invalid-y';
          }
        }

        // active block is moved out of the left screen
        if (x + activeBlock.x < 0) {
          return 'invalid-x';
        }

        // active block is moved out of the right screen
        if (x + activeBlock.x > 9) {
          return 'invalid-x';
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

/**
 * Returns an array of empty rows for the provided row count.
 *
 * @param      {number}  count   rows to generate
 */
function generateEmptyRows(count) {
  const rows = [ ];

  for (let i = 0; i < count; i++) {
    rows.push(Array(10));
  }

  return rows;
}

/**
 * Takes some rows and make random clear within the rows until clearCount is reached
 *
 * @param      {Arra<Array<any>>}   rows        array of rows
 * @param      {number}             clearCount  number of random clears
 * @return     {Array<Array<any>>}  rows
 */
function generateRandomClears(rows, clearCount = 1) {
  while (clearCount > 0) {
    const randomY = Math.round(Math.random() * (rows.length - 1));
    const randomX = Math.round(Math.random() * (rows[randomY].length - 1));

    if (rows[randomY][randomX]) {
      rows[randomY][randomX] = null;
      clearCount--;
    }
  }

  return rows;
}

module.exports = {
  checkForCollision,
  clearFullRows,
  generateEmptyRows,
  generateRandomClears,
  getDockPreview,
};