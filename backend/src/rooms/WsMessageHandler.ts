import { ErrorCodes, GameStatus, WsMessageType } from '@battletris/shared';
import GameUser, { GameUserStatus } from '../game/GameUser';
import config from '../lib/config';
import RoomHandler from './RoomHandler';
import WsConnection from './WsConnection';

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
      return;
    }
    case WsMessageType.USER_UPDATE: {
      const index = room.gameBridge.data.users
        .findIndex((dUser) => dUser?.id === connection.userId);
      if (index !== -1 && room.gameBridge.data.status === GameStatus.STARTED) {
        throw new Error(ErrorCodes.ALREADY_STARTED);
      }

      // TODO: do not update user, when user is in battle
      room.broadcastToWs(WsMessageType.USER_UPDATE, {
        userId: connection.userId,
        user: payload,
      });
      return;
    }
  }

  // game handler
  const game = room.gameBridge;
  const index = typeof payload?.index === 'undefined'
    ? game.data.users.findIndex((dUser) => dUser?.id === connection.userId)
    : payload.index;
  let startGame;
  switch (type) {
    case WsMessageType.GAME_JOIN: {
      if (index < 0 || index > (config.maxGameUsers - 1)) {
        throw new Error(ErrorCodes.USER_PLACE_NOT_ALLOWED);
      }
      if (room.gameBridge.data.users[index]) {
        throw new Error(ErrorCodes.USER_PLACE_NOT_ALLOWED);
      }
      if (game.data.status === GameStatus.STARTED) {
        throw new Error(ErrorCodes.ALREADY_STARTED);
      }

      game.data.users[index] = new GameUser(connection.userId);
      break;
    }
    case WsMessageType.GAME_LEAVE: {
      if (index !== -1) {
        if (!game.data.users[index]) {
          throw new Error(ErrorCodes.USER_PLACE_EMPTY);
        }
        if (game.data.users[index].id !== connection.userId) {
          throw new Error(ErrorCodes.CANNOT_KICK_ANOTHER_USER);
        }

        game.data.users[index] = null;

        // check if match should be terminated
        const isPlaying = game.data.users.find((u) => !!u);
        if (!isPlaying) {
          game.stop();
        }
      }
      break;
    }
    case WsMessageType.GAME_START: {
      game.data.users[index].status = GameUserStatus.ACCEPTED;
      // if all users accepted, start the game
      startGame = !game.data.users.find(
        (user) => user?.status === GameUserStatus.JOINED,
      );

      break;
    }
    case WsMessageType.GAME_STOP: {
      game.data.users[index].status = GameUserStatus.JOINED;
      break;
    }
    default: {
      console.log(`ws type: "${WsMessageType[type]}(${type})" not implemented`);
      return;
    }
  }

  await game.room.broadcastToWs(WsMessageType.GAME_USER_UPDATE, {
    [index]: game.data.users[index],
  });

  if (startGame && game.data.status !== GameStatus.STARTED) {
    await game.start();
    await game.room.broadcastToWs(WsMessageType.GAME_START);
  }
};
