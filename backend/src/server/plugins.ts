import fastifyCookie from 'fastify-cookie';
import fastifyCors from 'fastify-cors';
import fastifyStatic from 'fastify-static';
import { existsSync } from 'fs';
import path from 'path';
import config from '../lib/config';
import server from './server';
import './websocket';

server.register(fastifyCookie, {
  secret: config.cookieSecret,
});

server.register(fastifyCors, {
  credentials: true,
  origin: ['*', config.frontendUrl],
});

const publicPath = path.resolve('./dist/public');
if (existsSync('./dist/public')) {
  server.register(fastifyStatic, {
    root: publicPath,
    prefix: '/app',
  });

  // map wildcard resolver, so /roomId will resolve the index.html
  server.get('/*', (req, reply) => {
    reply.sendFile('index.html', path.resolve('./dist/public'));
  });
}

// use custom request logging
server.addHook('onRequest', (req, reply, done) => {
  if (req.raw.url.indexOf('/api') === 0) {
    server.log.debug(`[REQUEST][${req.raw.method}] ${req.raw.url}`);
  }

  done();
});
