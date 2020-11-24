export interface GameUserInterface {
  /** db user class */
  className: string;

  /** db user id */
  id: string;

  /** users currently displayed map */
  map: number[][];

  /** current active block */
  block: number;

  /** active block rotation */
  rotation: number;

  /** active block x position */
  x: number;

  /** active block x position */
  y: number;

  /** amount of cleared rows */
  rows: number;
}

export enum GameUserMapping {
  className = 0,
  id = 1,
  map = 2,
  block = 3,
  rotation = 4,
  x = 5,
  y = 6,
  rows = 7,
}

/**
 * Formats a game user object into an object with lower size (keys as numbers). Also reverses the
 * logic when passing a already formatted user.
 *
 * @param gameUser game user object to format
 */
export const formatGameUser = (gameUser: any): any => {
  const formatted: any = [];

  Object.keys(gameUser).forEach((key: any) => {
    // ignore not supported properties
    if (GameUserMapping[key] && gameUser[key]) {
      formatted[GameUserMapping[key]] = gameUser[key];
    }
  });

  return formatted;
};
