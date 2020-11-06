import fastifyCors from 'fastify-cors';

import config from '../lib/config';
import server from './server';

server.register(fastifyCors, {
  credentials: true,
  origin: ['*', config.frontendUrl],
});
