import { User } from '../db';

class GameUser {
  /** db user class */
  className: string;

  /** db user id */
  id: string;

  /** users currently displayed map */
  map: number[][];

  /** amount of cleared rows */
  rows: number;

  constructor(user: User) {
    // static values
    this.id = user.id;
    this.className = user.className;

    // game values
    this.rows = 0;
  }

  /** Serialize the game user into a json object. */
  serialize() {
    return {
      className: this.className,
      map: this.map,
    };
  }
}

export default GameUser;
