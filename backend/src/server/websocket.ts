import fastifyWS from 'fastify-websocket';
import RoomHandler from './RoomHandler';
import server from './server';

interface WsJoinCookies {
  battletris_id: string;
  battletris_room: string;
}

server.register(fastifyWS, {
  // creates an echo server
  handle: (conn) => conn.pipe(conn),
  options: {
    maxPayload: 1048576,
    path: '/ws',
  }
});

/**
 * Parse an object out of a cookie value.
 *
 * @param cookie cookie string value
 */
const parseCookie = (cookie: string): WsJoinCookies => {
  return cookie
    .split(';')
    .reduce((res, c) => {
      const [key, val] = c.trim().split('=').map(decodeURIComponent)
      const allNumbers = str => /^\d+$/.test(str);
      try {
        return Object.assign(res, { [key]: allNumbers(val) ?  val : JSON.parse(val) })
      } catch (e) {
        return Object.assign(res, { [key]: val })
      }
    }, {} as WsJoinCookies);
};

/**
 * Wait for new websocket connection and ensure a game process and add the websocket
 * connection.
 */
server.server.on('upgrade', async (request, socket) => {
  const { battletris_id, battletris_room } = parseCookie(request.headers.cookie);
  const room = await RoomHandler.ensure(battletris_room);
  await room.joinUser(battletris_id, socket);
});
