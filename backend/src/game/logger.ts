import pino from 'pino';
import config from '../lib/config';

const logger: pino = pino({
  prettyPrint: true,
  level: config.logLevel,
  base: {
    pid: process.pid,
    hostname: `GAME|${process.env.ROOM_ID}`,
  }
});

export default logger;
