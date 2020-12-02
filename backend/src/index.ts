import server from './server';
import './server/plugins';
import config from './lib/config';
import { startDb } from './db';
import ensureDefaultRooms from './lib/rooms.default';

// register plugins
import './server/plugins';

// register actions
import './actions';

const start = async () => {
  // load database json before
  await startDb();

  // create initial, predefined actions and start them
  await ensureDefaultRooms();

  // start server
  server.listen(config.port, '0.0.0.0', (err) => {
    if (err) {
      server.log.error(err.message);
      process.exit(1);
    }
  });
};

start();