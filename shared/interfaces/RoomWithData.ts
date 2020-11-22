import GameUserStatus from '../enums/GameUserStatus';
import GameData from './GameData';
import User from './User';

export default interface RoomWithData {
  id: string;

  name: string;

  connectionCount: number;

  isMatchRunning: boolean;

  game: GameData;

  users: Record<string, User>;

  gameRegistration: Record<string, GameUserStatus>;
}
