import fastifyCookie from 'fastify-cookie';

import server from './server';
import config from '../lib/config';

server.register(fastifyCookie, {
  secret: config.cookieSecret,
});
