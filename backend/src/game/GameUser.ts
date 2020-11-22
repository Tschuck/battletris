import { User } from '../db';

class GameUser {
  /** db user class */
  className: string;

  /** db user id */
  id: string;

  constructor(user: User) {
    this.id = user.id;
    this.className = user.className;
  }

  serialize() {
    return {
      className: this.className,
    };
  }
}

export default GameUser;
