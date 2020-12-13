import { Key } from 'ts-keycode-enum';

export enum GameUserMapping {
  className = 0,
  id = 1,
  map = 2,
  block = 3,
  nextBlocks = 4,
  rotation = 5,
  x = 6,
  y = 7,
  blockCount = 8,
  rowCount = 9,
  speed = 10,
}

/** Contains user param mapping that should not affect the diff and parsing parameters */
export enum HiddenGameUserMapping {
  userEvents = 20,
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
 * Mapping of user state changes. Can be either a technical one (like new block), or a user
 * interaction (keys).
 */
export enum GameStateChange {
  LOST = -1,
  NEW_BLOCK = 0,
  TURN = Key.UpArrow,
  LEFT = Key.LeftArrow,
  RIGHT = Key.RightArrow,
  DOWN = Key.DownArrow,
  NEXT_TARGET = Key.Tab,
  FALL_DOWN = Key.Space,
}

/**
 * Formats a game user object into an object with lower size (keys as numbers). Also reverses the
 * logic when passing a already formatted user.
 *
 * @param gameUser game user object to format
 * @param baseObject use array to reduce formatted size
 */
export const formatGameUser = (gameUser: any, baseObject: []|{} = []): any => {
  const formatted: any = baseObject;

  Object.keys(gameUser).forEach((key: any) => {
    // ignore not supported properties
    if (GameUserMapping[key]
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
    if ((key === 'nextBlocks' || key === `${GameUserMapping.nextBlocks}`)
      && JSON.stringify(newObj[key]) !== JSON.stringify(oldObj[key])) {
      diff[key] = newObj[key];
      return;
    }

    // build the diff
    if (oldObj[key] !== newObj[key]) {
      diff[key] = newObj[key];
    }
  });

  return diff;
}

/**
 * Get the given value or the fallback default value
 * @param value value to check
 * @param previous fallback value
 */
export const updatedOrPrevious = (value: number|undefined, previous: number) => (value !== undefined
  ? value : previous);

/**
 * Update game user state with and user update.
 *
 * @param state user state
 * @param update partial user state
 */
export const applyStateUpdate = (state: any, update: any) => {
  Object.keys(update).forEach((key) => {
    if (key === 'map' || key === `${GameUserMapping.map}`) {
      state[key] = state[key].map(
        (row: number[], index: number) => (update[key][index] ? update[key][index] : row),
      );
      return;
    }

    state[key] = updatedOrPrevious(update[key], state[key]);
  });
};

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
 * Gets the lowest possible position for the given block.
 *
 * @param map to check
 * @param block active, turned block
 * @param y block y
 * @param x block x
 */
export const getPreviewY = (map: number[][], block: number[][], y: number, x: number) => {
  // initially start with y minus one, that will be directly raised at the beginning
  let previewY = y - 1;

  let collision;
  while (collision !== CollisionType.DOCKED && previewY !== map.length && previewY < 20) {
    previewY += 1;
    collision = getStoneCollision(map, block, previewY, x);
  }

  return previewY - 1;
};
