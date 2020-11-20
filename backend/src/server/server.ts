import fastify, { FastifyInstance } from 'fastify';
import config from '../lib/config';

const server: FastifyInstance = fastify({
  disableRequestLogging: true,
  logger: {
    level: config.logLevel,
    prettyPrint: true,
    base: {
      pid: process.pid,
      hostname: 'SERVER'
    }
  } as any,
});

export default server;
