import fastifyWS from 'fastify-websocket';
import cookieSignature from 'cookie-signature';

import gameManager from '../gameManager';
import server from '../server';
import config from '../config';
import errorCodes from '../error.codes';
import WsConnection from '../WsConnection';

const connectionMap = { };

server.register(fastifyWS, {
  // creates an echo server
  handle: (conn) => conn.pipe(conn),
  options: {
    maxPayload: 1048576,
    path: '/ws',
  }
});

// add global websocket handler
server.get('/ws', { websocket: true }, (connection) => {
  new WsConnection(connection);
});