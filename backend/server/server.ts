import fastify, { FastifyInstance } from 'fastify';

const server: FastifyInstance = fastify({
  disableRequestLogging: true,
  logger: {
    level: 'debug',
    prettyPrint: true,
  },
});

export default server;
