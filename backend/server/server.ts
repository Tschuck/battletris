import fastify, { FastifyInstance } from 'fastify';
import fastifyWS from 'fastify-websocket';
import fastifyCors from 'fastify-cors';

import gameManager from './gameManager';

const server: FastifyInstance = fastify({
  disableRequestLogging: true,
  logger: {
    level: 'debug',
    prettyPrint: true,
  },
});

// Examples of hooks to replicate the disabled functionality.
server.addHook('onRequest', (req, reply, done) => {
  server.log.info(`[REQUEST][${req.raw.method}] ${req.raw.url}`);
  done()
});

server.addHook('onResponse', (req, reply, done) => done());

server.register(fastifyCors, {
  origin: '*',
})
server.register(fastifyWS, {
  // creates an echo server
  handle: (conn) => conn.pipe(conn),
  options: {
    maxPayload: 1048576,
    path: '/ws',
  }
});

// add global websocket handler
server.get('/ws', { websocket: true }, (connection, req) => {
  console.log(connection);
  console.log(req);
  connection.socket.on('message', (message: string) => {
    try {
      const { name, type, payload } = JSON.parse(message);
      gameManager.sendToGame(name, type, payload);
    } catch (ex) {
      connection.socket.send({ type: 'error', error: ex });
      server.log.error(`[WS] not parsed: ${message} (${ex})`);
    }
  });
});

export default server;
