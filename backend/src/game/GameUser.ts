import { GameUserInterface } from '@battletris/shared';
import config from '../lib/config';
import * as mapHelper from './helpers/mapHelper';

export enum GameUserStatus {
  JOINED = 'JOINED',
  ACCEPTED = 'ACCEPTED',
}

export default class GameUser implements GameUserInterface {
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

  constructor(userId: string) {
    // when armor gets damaged to zero, the add line ability is called
    this.armor = 100;
    // block turn (press up)
    this.blockIndex = -1;
    // connection id
    this.id = userId;
    // locked abilities for a specific time
    this.cooldowns = [ ];
    // buffs / debuffs
    this.effects = [ ];
    // current speed level
    this.level = 1;
    // users full map
    this.map = mapHelper.getEmptyMap();
    // amount of mana
    this.mana = 0;
    // cleared rows
    this.rows = 0;
    // keep old status of the user (open, joined, accepted, lost, won)
    this.status = GameUserStatus.JOINED;
    // users speed
    this.userSpeed = config.userSpeed;
    // target connection id for applying abilities and block resolvles
    this.targetId = userId;
  }
}