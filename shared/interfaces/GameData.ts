import GameStatus from "../enums/GameStatus";
import GameUser from "./GameUser";

export default interface GameDataInterface {
  users: GameUser[];

  status: GameStatus;
};
