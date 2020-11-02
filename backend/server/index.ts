import * as Throttle from 'promise-parallel-throttle';

import config from './config';
import server from './server';

// register plugins
import './plugins';

// register actions
import './actions';
import gameManager from './gameManager';

const start = async () => {
  // create initial, predefined actions
  const gameArr = Array.from(Array(config.defaultGameCount).keys());
  await Throttle.all(gameArr.map((_, i) => async () => {
    await gameManager.create(`BATTLETRIS ${i+1}`);
  }), { maxInProgress: 10, failFast: true });

  // start server
  server.listen(config.port, (err) => {
    if (err) {
      server.log.error(err);
      process.exit(1);
    }
  });
};

start();