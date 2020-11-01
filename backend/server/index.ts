import config from './config';
import server from './server';

// register actions
import './actions';

server.listen(config.port, (err) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }
});
