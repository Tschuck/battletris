import fastifyWS from 'fastify-websocket';
import { roomAccess, rooms } from './RoomHandler';
import server from './server';

interface WsJoinCookies {
  battletris_room_join_token: string;
}

server.register(fastifyWS, {
  // creates an echo server
  handle: (conn) => conn.pipe(conn),
  options: {
    maxPayload: 1048576,
  },
});

/**
 * Wait for new websocket connection and ensure a game process and add the websocket
 * connection.
 */
server.server.on('upgrade', async (request, socket) => {
  // split ws connection url
  const [ , type, token ] = decodeURIComponent(request.url).split('/');
  if (!token) {
    return socket.destroy(new Error('invalid join token'));
  }

  // verify token
  const [ , roomId, userId ] = token.split('|||');
  if (!rooms[roomId] || !roomAccess.has(token)) {
    return socket.destroy(new Error('join token expired'));
  }

  // add websocket to its specific handler
  const room = rooms[roomId];
  switch (type) {
    case 'room': {
      return room.wsJoin(userId, socket);
    }
    case 'game': {
      return room.processWsForward(request.headers, userId, socket);
    }
  }
});

// server.get('/game', { websocket: true }, (connection, message: IncomingMessage) => {
//   const { battletris_room_join_token: token } = parseCookie(message.headers.cookie);
//   if (!token) {
//     return message.socket.destroy(new Error('invalid join token'));
//   }
//   const [ , roomId, userId ] = token.split('|||');
//   if (rooms[roomId] && roomAccess.has(token)) {
//     rooms[roomId].joinUser(message.headers as any, userId, message.socket);
//     return;
//   }

//   message.socket.destroy(new Error('join token expired'));
// });