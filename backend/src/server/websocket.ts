import fastifyWS from 'fastify-websocket';

import server from './server';
import WsConnection from '../rooms/WsConnection';

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