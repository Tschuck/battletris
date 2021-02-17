import _ from 'lodash';

/**
 * Returns an array of empty rows for the provided row count.
 *
 * @param count   rows to generate
 */
function generateEmptyRows(count: number): number[][] {
  const rows = [];

  for (let i = 0; i < count; i += 1) {
    rows.push(Array(10));
  }

  return rows;
}

/**
 * Returns a empty map with an count of rows
 *
 * @param count   count of rows
 */
function getEmptyMap(count = 20, map: number[][] = []): number[][] {
  for (let y = map.length; y < count; y += 1) {
    map.push([...Array(10)].map(() => 0));
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
function generateRandomClears(rows: number[][], clearCount = 1): number[][] {
  while (clearCount > 0) {
    const randomY = Math.round(Math.random() * (rows.length - 1));
    const randomX = Math.round(Math.random() * (rows[randomY].length - 1));

    if (rows[randomY][randomX]) {
      (rows[randomY][randomX] as any) = null;
      clearCount -= 1;
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
function generateRandomAreaClear(area: number[][], map: number[][]) {
  let foundIndex;
  const [xRow] = area;
  const xLen = xRow.length;
  const yLen = area.length;
  let reverseX = 1;
  let reverseY = -1;
  let randomY: number;
  let randomX: number;

  // before doing anything, check for empty map, if yes, return
  let mapContent = 0;
  map.forEach((y) => {
    mapContent += _.compact(y).length;
  });
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
        (map[randomY + (yIndex * reverseY)][randomX + (xIndex * reverseX)] as any) = undefined;
      }
    });
  });

  return map;
}

/**
 * Detect full rows, removes them, adds more empty lines at top and returns the amount of cleared
 * rows.
 *
 * @param      {Array<Array<any>>}  map     map definition (20x10)
 */
function clearFullRows(map: number[][]): number {
  let counter = 0;

  for (let y = map.length - 1; y > -1; y -= 1) {
    // check if all cols are filled in a row
    if (map[y].filter((col) => !col).length === 0) {
      // increase the counter
      counter += 1;
      // remove the row
      map.splice(y, 1);
      // add a new one
      map.unshift([...Array(10)]);
      // check the new last row again
      y += 1;
    }
  }

  return counter;
}

/**
 * Fill gaps in the map that have blocks above them
 *
 * @param      {Array<Array<any>>}  map         map to be flattened
 * @return     {Array<Array<any>>}  map         flattened map
 */
function flattenMap(map: number[][]): number[][] {
  let colArr;
  for (let x = 0; x < 10; x += 1) {
    colArr = [];
    for (let y = 0; y < map.length; y += 1) {
      colArr.push(map[y][x]);
    }
    colArr = _.compact(colArr);
    colArr = Array(map.length - colArr.length - 1).concat(colArr);
    for (let y = map.length - 2; y > 0; y -= 1) {
      map[y][x] = colArr[y];
    }
  }
  clearFullRows(map);
  return map;
}

/**
 * Gets a random between to numbers
 *
 * https://stackoverflow.com/questions/4959975/generate-random-number-between-two-numbers-in-javascript
 *
 * @param min min value
 * @param max max value
 */
function getRandomNumber(min: number, max: number): number { // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export {
  flattenMap,
  generateEmptyRows,
  generateRandomAreaClear,
  generateRandomClears,
  getEmptyMap,
  getRandomNumber,
};
