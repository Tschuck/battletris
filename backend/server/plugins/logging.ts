import server from '../server';

// use custom request logging
server.addHook('onRequest', (req, reply, done) => {
  server.log.info(`[REQUEST][${req.raw.method}] ${req.raw.url}`);
  done();
});