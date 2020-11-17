import { GameUserInterface } from '@battletris/shared';
import config from '../lib/config';
import * as mapHelper from './helpers/mapHelper';

export enum GameUserStatus {
  JOINED = 'JOINED',
  ACCEPTED = 'ACCEPTED',
}

export default class GameUser implements GameUserInterface {
  armor: number;
  blockIndex: number;
  id: string;
  cooldowns: string[];
  effects: string[];
  level: number;
  map: number[][];
  mana: number;
  rows: number;
  status: GameUserStatus;
  userSpeed: number;
  targetId: string;
  gameLoop: NodeJS.Timeout;

  constructor(userId) {
    this.id = userId;
    this.blockIndex = -1;
    this.cooldowns = [ ];
    this.level = 1;
    this.map = mapHelper.getEmptyMap();
    this.rows = 0;
    this.status = GameUserStatus.JOINED;
    this.userSpeed = config.userSpeed;
  }

  startGameLoop() {
    this.gameLoop = setInterval(() => {

    }, this.userSpeed);
  }
}