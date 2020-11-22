import GameUserStatus from '../enums/GameUserStatus';
import User from './User';

export default interface RoomWithData {
  id: string;

  name: string;

  connectionCount: number;

  isMatchRunning: boolean;

  users: Record<string, User>;

  gameRegistration: Record<string, GameUserStatus>;
}
