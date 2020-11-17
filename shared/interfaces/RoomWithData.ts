import GameData from './GameData';
import User from './User';

export default interface RoomWithData {
  id: string;

  name: string;

  connectionCount: number;

  isMatchRunning: boolean;

  game: GameData;

  users: {[id: string]: User};
}
