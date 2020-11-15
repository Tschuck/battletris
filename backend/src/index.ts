import server from './server';
import config from './lib/config';
import { startDb, Room } from './db';
import ensureDefaultRooms from './lib/rooms.default';

// register plugins
import './server/plugins';

// register actions
import './actions';
import RoomHandler from './rooms/RoomHandler';

const start = async () => {
  // load database json before
  await startDb();

  // create initial, predefined actions and start them
  await ensureDefaultRooms();
  const rooms = await Room.find();
  rooms.forEach((entity) => new RoomHandler(entity));

  // start server
  server.listen(config.port, (err) => {
    if (err) {
      server.log.error(err.message);
      process.exit(1);
    }
  });
};

start();