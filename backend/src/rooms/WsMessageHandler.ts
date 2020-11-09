import { cloneDeep } from 'lodash';

import GameUser, { GameUserStatus } from "../game/GameUser";
import { GameStatus } from '../game/helpers/interfaces';
import config from "../lib/config";
import ErrorCodes from "../lib/error.codes";
import RoomHandler from "./RoomHandler";
import WsConnection from "./WsConnection";

export enum WsMessageType {
  ROOM_JOIN = 0,
  ROOM_LEAVE = 1,
  USER_UPDATE = 2,
  CHAT = 3,
  GAME_JOIN = 4,
  GAME_LEAVE = 5,
  GAME_START = 6,
  GAME_STOP = 7,
  GAME_UPDATE = 8,
  GAME_USER_UPDATE = 9,
}

export default async (
  room: RoomHandler,
  connection: WsConnection,
  type: WsMessageType,
  payload: any,
) => {
  // room handler
  switch (type) {
    case WsMessageType.CHAT: {
      room.broadcastToWs(WsMessageType.CHAT, {
        message: payload,
        id: connection.userId,
      });
      break;
    }
    case WsMessageType.USER_UPDATE: {
      // TODO: do not update user, when user is in battle
      room.broadcastToWs(WsMessageType.USER_UPDATE, {
        userId: connection.userId,
        user: payload,
      });
      break;
    }
  }

  // game handler
  const game = room.gameBridge;
  const beforeData = cloneDeep(room.gameBridge.data);
  // index related messages
  let index = typeof payload?.index === 'undefined'
    ? game.data.users.findIndex((dUser) => dUser?.userId === connection.userId)
    : payload.index;
  switch (type) {
    case WsMessageType.GAME_JOIN: {
      if (index < 0 || index > (config.maxGameUsers - 1)) {
        throw new Error(ErrorCodes.USER_PLACE_NOT_ALLOWED);
      }
      if (room.gameBridge.data.users[index]) {
        throw new Error(ErrorCodes.USER_PLACE_NOT_ALLOWED);
      }

      game.data.users[index] = new GameUser(connection.userId);
      break;
    }
    case WsMessageType.GAME_LEAVE: {
      if (index !== -1) {
        if (!game.data.users[index]) {
          throw new Error(ErrorCodes.USER_PLACE_EMPTY);
        }
        if (game.data.users[index].userId !== connection.userId) {
          throw new Error(ErrorCodes.CANNOT_KICK_ANOTHER_USER);
        }

        game.data.users[index] = null;
      }
      break;
    }
    case WsMessageType.GAME_START: {
      game.data.users[index].status = GameUserStatus.ACCEPTED;
      // if all users accepted, start the game
      const allStarted = !game.data.users.find(
        (user) => user.status === GameUserStatus.JOINED,
      );
      game.data.status = GameStatus.STARTED;

      break;
    }
    case WsMessageType.GAME_STOP: {
      game.data.users[index].status = GameUserStatus.JOINED;
      break;
    }
    default: {
      console.log(`ws type: "${type}" not implemented`);
      return;
    }
  }

  await game.room.broadcastToWs(WsMessageType.GAME_USER_UPDATE, {
    [index]: game.data.users[index],
  });

  if (game.data.status === GameStatus.STARTED) {
    await game.start();
    await game.room.broadcastToWs(WsMessageType.GAME_START);
  }
};
