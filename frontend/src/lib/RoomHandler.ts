import { RoomWithDataInterface, WsMessageType } from '@battletris/shared';
import { merge } from 'lodash';
import { getRequest } from './request';
// eslint-disable-next-line import/no-cycle
import RoomConnection from './RoomConnection';
// eslint-disable-next-line import/no-cycle
import currUser from './User';

export class RoomHandler {
  rooms: { [id: string]: RoomWithDataInterface } = {};

  async load() {
    this.rooms = await getRequest('rooms');
  }

  defaultMessageHandler(conn: RoomConnection, type: WsMessageType, payload: any) {
    if (conn?.room) {
      const { room } = conn;
      switch (type) {
        case WsMessageType.ROOM_JOIN:
        case WsMessageType.USER_UPDATE: {
          room.users[payload.userId] = payload.user;
          break;
        }
        case WsMessageType.ROOM_LEAVE: {
          delete room.users[payload.userId];
          break;
        }
        case WsMessageType.GAME_USER_UPDATE: {
          room.game.users = merge(room.game.users, payload);
          // eslint-disable-next-line no-param-reassign
          conn.activeIndex = room.game.users.findIndex(
            (regUser) => currUser.id.startsWith(regUser?.id),
          );
          break;
        }
        case WsMessageType.GAME_UPDATE: {
          room.game = merge(room.game, payload);
          break;
        }
        default: {
          console.log(`${type} ws messages not implemented`);
        }
      }
    }
  }
}

export default new RoomHandler();
