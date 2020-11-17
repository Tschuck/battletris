import fastifyCookie from 'fastify-cookie';
import fastifyCors from 'fastify-cors';
import config from '../lib/config';
import server from './server';

server.register(fastifyCookie, {
  secret: config.cookieSecret,
});

server.register(fastifyCors, {
  credentials: true,
  origin: ['*', config.frontendUrl],
});

// use custom request logging
server.addHook('onRequest', (req, reply, done) => {
  server.log.info(`[REQUEST][${req.raw.method}] ${req.raw.url}`);
  done();
});