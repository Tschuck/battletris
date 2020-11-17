import GameStatus from '../enums/GameStatus';
import { GameUserInterface } from './GameUser';

export default interface GameDataInterface {
  users: GameUserInterface[];

  status: GameStatus;
}
