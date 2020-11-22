import { roomAccess, rooms } from './RoomHandler';
import server from './server';
import WebSocket from 'ws';

const roomWs = new WebSocket.Server({ noServer: true });

/**
 * Wait for new websocket connection and ensure a game process and add the websocket
 * connection.
 */
server.server.on('upgrade', async (request, socket, head) => {
  // split ws connection url
  const [ ,,type, token ] = decodeURIComponent(request.url).split('/');
  if (!token) {
    server.log.error('invalid join token');
    return socket.destroy();
  }

  // verify token
  const [ , roomId, userId ] = token.split('|||');
  if (!rooms[roomId] || !roomAccess.has(token)) {
    server.log.error('join token expired');
    return socket.destroy();
  }

  // add websocket to its specific handler
  const room = rooms[roomId];
  switch (type) {
    case 'room': {
      roomWs.handleUpgrade(
        request,
        socket,
        head,
        (ws: WebSocket) => room.wsJoin(userId, ws),
      );
      break;
    }
    case 'game': {
      return room.processWsForward(request.headers, userId, socket);
    }
  }
});
