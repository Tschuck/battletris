const _ = require('lodash');

/**
 * Checks for block collisions and detects, if a stone gets docked to the bottom or to another
 * stone.
 *
 * @param      {Array<Array<any>>}  map            map definition (20x10)
 * @param      {Array<Array<any>>}  activeBlock    active block map
 * @param      {Array<Array<any>>}  originalBlock  block before it was moved
 * @return     {(boolean|any)}      false for no collision / object with x / y and collision type ({
 *                                  type: invalid / docked, x: 0, y: 0 })
 */
function checkForCollision(map, activeBlock, originalBlock, onlyType = false) {
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
        /**
         * Returns a collision object with details about position and the type
         *
         * @param      {string}         type    collision type ()
         * @return     {string|Object}  if onlyType only string type, else collison object.
         */
        const returnCollision = (type) => {
          // if only type is needed, return only this, else return collision object.
          return onlyType ? type : {
            type,
            x: x + activeBlock.x,
            y: y + activeBlock.y,
          };
        }

        
        if (
          // user has reached the ground
          (y + activeBlock.y > 20) ||
          (// active block is moved out of the left screen
          x + activeBlock.x < 0) ||
          // active block is moved out of the right screen
          (x + activeBlock.x > 9)
        ) {
          return returnCollision('invalid');
        }

        // only detect docking when y was moved, but not the x axes
        if (detectDocking) {
          // user has reached the ground
          if (y + activeBlock.y === 20) {
            return returnCollision('docked');
            // check for y collision, the block will be attached on top
          } else if (map[activeBlock.y + y] && map[activeBlock.y + y][activeBlock.x + x]) {
            return returnCollision('docked');
          }
        } else {
          if (map[activeBlock.y + y] && map[activeBlock.y + y][activeBlock.x + x]) {
            return returnCollision('invalid');
          }
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
    docked = checkForCollision(map, blockCopy, null, true) === 'docked';
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
 * Returns a empty map with an count of rows
 *
 * @param      {number}  count   count of rows
 */
function getEmptyMap(count = 20, map = [ ]) {
  for (let y = map.length - 1; y < 20; y++) {
    map.push([...Array(10)]);
  }

  return map;
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

/**
 * Randomly clear spaces of a given size in the given map
 *
 * @param      {Array<Array<any>>}  area        map area to be cleared
 * @param      {Array<Array<any>>}  map         map to be altered
 * @return     {Array<Array<any>>}  map         altered map
 */
function generateRandomAreaClear(area, map) {
  let foundIndex;
  const [xRow] = area;
  const xLen = xRow.length;
  const yLen = area.length;
  let reverseX = 1;
  let reverseY = -1;
  let randomY;
  let randomX;

  // before doing anything, check for empty map, if yes, return
  let mapContent = 0;
  map.forEach((y) => {
    mapContent += _.compact(y).length;
  })
  if (!mapContent) {
    return map;
  }

  while (!foundIndex) {
    randomY = Math.round(Math.random() * (map.length - 1));
    randomX = Math.round(Math.random() * (map[randomY].length - 1));

    if (map[randomY][randomX]) {

      // reverse X flow if it transcends the field boundary
      if (randomX + xLen > map[randomY].length) {
        reverseX = -1;
      } 

      // go upwards instead of down if it goes below row 0
      if (randomY - yLen < 0) {
        reverseY = 1;
      }
      foundIndex = true;
    }
  }

  area.forEach((y, yIndex) => {
    y.forEach((x, xIndex) => {
      if (x) {
        map[randomY + (yIndex * reverseY)][randomX + (xIndex * reverseX)] = undefined;
      }
    })
  })

  return map;
}

/**
 * Fill gaps in the map that have blocks above them
 *
 * @param      {Array<Array<any>>}  map         map to be flattened
 * @return     {Array<Array<any>>}  map         flattened map
 */
function flattenMap(map) {
  let colArr;
  for (let x = 0; x < 10; x++) {
    colArr = [];
    for (let y = 0; y < map.length; y++) {
      colArr.push(map[y][x])
    }
    colArr = _.compact(colArr);
    colArr = Array(map.length - colArr.length - 1).concat(colArr)
    for (let y = map.length - 2; y > 0; y--) {
      map[y][x] = colArr[y];
    }
  }
  clearFullRows(map);
  return map;
}


module.exports = {
  checkForCollision,
  clearFullRows,
  generateEmptyRows,
  generateRandomClears,
  getDockPreview,
  getEmptyMap,
  generateRandomAreaClear,
  flattenMap
};