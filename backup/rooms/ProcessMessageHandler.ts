import { ProcessMessageType, WsMessageType } from '@battletris/shared';
import GameBridge from './GameBridge';

export default async (
  game: GameBridge,
  type: ProcessMessageType,
  payload: any,
) => {
  try {
    switch (type) {
      // user interacted with the game
      case ProcessMessageType.LOG: {
        game.log(payload.type, payload.message);
        break;
      }
      // resolve the game creation and update the game data
      case ProcessMessageType.INITIALIZE: {
        game.log('debug', 'initialized');
        game.data = payload;
        game.initResolve();
        break;
      }
      case ProcessMessageType.STOPPED: {
        game.reset();
        await game.room.broadcastToWs(WsMessageType.GAME_UPDATE, game.data);
        await game.room.broadcastToWs(WsMessageType.GAME_STATS, {
          winner: 'TODO',
        });
        break;
      }
      case ProcessMessageType.GAME_USER_UPDATE: {
        await game.room.broadcastToWs(WsMessageType.GAME_USER_UPDATE, payload);
        break;
      }
      default: {
        game.log('error', `unknown message type: ${ProcessMessageType[type]}`);
        break;
      }
    }
  } catch (ex) {
    game.log('error', `[GAME_BRIDGE] not parsed: ${type} (${ex.message})`);
  }
}