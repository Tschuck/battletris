import GameUser from '../GameUser';

export enum GameStatus {
  STARTED = 'STARTED',
  STARTING = 'STARTING',
  STOPPED = 'STOPPED',
}

export interface Block {
  map: number[][],
  rotation: 0,
  // number type of block
  type: number,
  x: number,
  // the block map for the long block and the square, starting with an empty zero row
  y: number,
}

export interface GameDataInterface {
  users: { [id: string]: GameUser };

  status: GameStatus;
};
