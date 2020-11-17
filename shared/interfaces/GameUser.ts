import GameUserStatus from '../enums/GameUserStatus';
import User from './User';

export interface MinimalGameUserInterface {
  id: string;
  // keep old status of the user (open, joined, accepted, lost, won)
  status: GameUserStatus;
}

export interface GameUserInterface extends MinimalGameUserInterface {
  // block turn (press up)
  blockIndex: number;
  // current speed level
  level: number;
  // users full map
  map: number[][];
  // cleared rows
  rows: number;
  // users speed
  userSpeed: number;
}

export interface EnrichedGameUserInterface extends User, GameUserInterface { }
