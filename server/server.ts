import fastify, { FastifyInstance } from 'fastify';
import fastifyWS from 'fastify-websocket';

const server: FastifyInstance = fastify({
  logger: {
    level: 'debug',
    prettyPrint: true,
  },
});

server.register(fastifyWS, {
  // creates an echo server
  handle: (conn) => conn.pipe(conn),
  options: {
    maxPayload: 1048576,
    path: '/ws',
  }
});

export default server;
