import { createConnection } from 'typeorm';
import config from '../lib/config';
import Room from './Room';
import Match from './Match';
import User from './User';
import UserKeyMap from './UserKeyMap';

let connection;
const startDb = async () => {
  connection = await createConnection({
    type: 'sqlite',
    database: config.dbPath,
    entities: [
      UserKeyMap,
      Match,
      Room,
      User,
    ],
    synchronize: true,
  });
}

export {
  connection,
  Match,
  Room,
  startDb,
  User,
  UserKeyMap,
};
