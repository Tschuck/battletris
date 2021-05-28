import { isEqual } from 'lodash';

export enum GameUserMapping {
  id = 0,
  className = 1,
  name = 2,
  map = 3,
  block = 4,
  nextBlocks = 5,
  rotation = 6,
  x = 7,
  y = 8,
  blockCount = 9,
  rowCount = 10,
  level = 11,
  speed = 12,
  maxMana = 13,
  maxArmor = 14,
  exp = 15,
  maxExp = 16,
  armor = 17,
  mana = 18,
  effects = 19,
  target = 20,
  queue = 21,
  interactionCount = 22,
  lost = 23,
  cooldowns = 24,
  hold = 25,
  holdLock = 26,
  gameIsStarted = 27,
}

/**
 * Type of a collision. DOCKED will be determined, if a block was moved down and a overlapping with
 * the game map happens
 */
export enum CollisionType {
  DOCKED = 1,
  OUT_OF_BOUNDS_X = 2,
  OUT_OF_BOUNDS_Y = 3,
}

/**
 * Formats a game user object into an object with lower size (keys as numbers). Also reverses the
 * logic when passing a already formatted user.
 *
 * @param gameUser game user object to format
 * @param baseObject use array to reduce formatted size
 */
export const transformUserTransport = (gameUser: any, baseObj: []|{} = []): any => {
  const formatted: any = baseObj;

  Object.keys(gameUser).forEach((key: any) => {
    // ignore unsupported properties
    if (typeof GameUserMapping[key] !== 'undefined'
      && gameUser[key] !== undefined
      && gameUser[key] !== null) {
      formatted[GameUserMapping[key]] = gameUser[key];
    }
  });

  return formatted;
};

/**
 * Iterate over a map of blocks.
 *
 * @param itMap map to iterated (game map / block map)
 * @param callback function that should be called
 */
export const iterateOverMap = (
  itMap: number[][],
  callback: (value: number, y: number, x: number) => any,
): any => {
  for (let y = itMap.length - 1; y !== -1; y -= 1) {
    for (let x = itMap[y].length - 1; x !== -1; x -= 1) {
      // early exit
      const value = callback(itMap[y][x], y, x);
      if (value) {
        return value;
      }
    }
  }

  return null;
};

/**
 * Return a nested property from an object.
 * @param obj obj to get nested value from
 * @param path path to select
 */
export const getNestedVal = (obj: any, ...selector: any[]) => {
  let returnVal = obj;
  for (let i = 0; i < selector.length; i += 1) {
    if (typeof returnVal[selector[i]] === 'undefined') {
      return null;
    }

    returnVal = returnVal[selector[i]];
  }

  return returnVal;
};

/**
 * Compares two game users objects and returns the difference
 * @param newObj new user obj
 * @param oldObj old user obj
 */
export function getDifference(
  newObj: Partial<any> = { },
  oldObj: Partial<any> = { },
) {
  const diff: Partial<any> = {};

  Object.keys(newObj).forEach((key) => {
    // check map changes separately
    if (key === 'map' || key === `${GameUserMapping.map}`) {
      const map: number[][] = newObj[key];
      // check for map changes
      for (let y = 0; y < map.length; y += 1) {
        for (let x = 0; x < map[y].length; x += 1) {
          // update always the full row, otherwise we get problems in ui merging logic
          if (getNestedVal(newObj, key, y, x) !== getNestedVal(oldObj, key, y, x)) {
            diff[key] = diff[key] || [];
            diff[key][y] = map[y];
            break;
          }
        }
      }
      return;
    }

    // build the diff
    if (!isEqual(newObj[key], oldObj[key])) {
      diff[key] = newObj[key];
    }
  });

  return diff;
}

/**
 * Check if a block map overlaps with the underlying game map.
 * @param block block map to check
 */
export const getStoneCollision = (
  map: number[][],
  block: number[][],
  y: number,
  x: number,
): CollisionType => iterateOverMap(block, (value, itY, itX) => {
  const xOnMap = x + itX;
  const yOnMap = y + itY;

  // out of bounds on the left or on the right
  if ((xOnMap < 0 || xOnMap > 9) && value) {
    return CollisionType.OUT_OF_BOUNDS_X;
  }

  // out of bounds at the bottom
  if (yOnMap > 20 && value) {
    return CollisionType.OUT_OF_BOUNDS_Y;
  }

  // detect only initial dock at the bottom
  if (yOnMap === 20 && value) {
    return CollisionType.DOCKED;
  }

  // block overlaps!
  if (map[yOnMap] && map[yOnMap][xOnMap] && value) {
    return CollisionType.DOCKED;
  }

  return null;
});

/**
 * Transforms the current rotation counter into a block index
 */
export const getRotationBlockIndex = (rotation: number): number => {
  const rotationIndex = rotation % 4;

  if (rotationIndex < 0) {
    return rotationIndex + 4;
  }

  return rotationIndex;
};

/**
 * Gets the lowest possible position for the given block.
 *
 * @param map to check
 * @param block active, turned block
 * @param y block y
 * @param x block x
 */
export const getPreviewY = (map: number[][], block: number[][], y: number, x: number): number => {
  // initially start with y minus one, that will be directly raised at the beginning
  let previewY = y - 1;

  let collision;
  while (collision !== CollisionType.DOCKED && previewY !== map.length && previewY < 20) {
    previewY += 1;
    collision = getStoneCollision(map, block, previewY, x);
  }

  return previewY - 1;
};
