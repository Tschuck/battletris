import GameUserStatus from '../enums/GameUserStatus';
import User from './User';

export default interface GameUser {
  // when armor gets damaged to zero, the add line ability is called
  armor: number;
  // block turn (press up)
  blockIndex: number;
  // connection id
  id: string;
  // locked abilities for a specific time
  cooldowns: string[];
  // buffs / debuffs
  effects: string[];
  // current speed level
  level: number;
  // users full map
  map: number[][];
  // amount of mana
  mana: number;
  // cleared rows
  rows: number;
  // keep old status of the user (open, joined, accepted, lost, won)
  status: GameUserStatus;
  // users speed
  userSpeed: number;
  // target connection id for applying abilities and block resolvles
  targetId: string;
}

export interface EnrichedGameUserInterface extends User, GameUser { }
