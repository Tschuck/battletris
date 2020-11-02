import fastifyWS from 'fastify-websocket';
import cookieSignature from 'cookie-signature';

import gameManager from '../gameManager';
import server from '../server';
import config from '../config';
import errorCodes from '../error.codes';

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
  let connectionId;
  let gameName;

  connection.socket.on('message', async (message: string) => {
    try {
      const { type, payload } = JSON.parse(message);
      switch (type) {
        case 'joinUser': {
          // allow only one join per connection
          if (connectionId) {
            throw new Error(errorCodes.CONNECTION_ID_ALREADY_REGISTERED);
          }

          // check if connectionid is correct
          const signedConnectionId = payload.id;
          const unsignedConnectionId = await cookieSignature.unsign(
            signedConnectionId,
            config.cookieSecret,
          );
          if (!unsignedConnectionId) {
            throw new Error(errorCodes.CONNECTION_ID_INVALID);
          }
          // set connectionId
          connectionId = unsignedConnectionId;

          // register connection in game
          gameName = payload.gameName;
          gameManager.games[gameName].addWsConnection(connectionId, connection);
          break;
        }
        case 'chat': {
          gameManager.games[gameName].broadcastToWs('chat', payload);
          break;
        }
        default: {
          gameManager.games[gameName].sendToProcess(type, payload);
          break;
        }
      }
    } catch (ex) {
      connection.socket.send(JSON.stringify({ type: 'error', error: ex.message }));
      server.log.error(`[WS] not parsed: ${message} (${ex})`);
    }
  });

  connection.socket.on('close', (message: string) => {
    gameManager.games[gameName].removeWsConnection(connectionId);
  });
});