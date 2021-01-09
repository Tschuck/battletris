import {
  WsMessageType,
} from '@battletris/shared';
import WsConnection from './WsConnection';

// only keep the last connection opened
let lastConnection: RoomConnection|null;

export const getCurrentConnection = (): RoomConnection|null => lastConnection;

export const disconnectLastConnection = () => {
  if (lastConnection) {
    lastConnection.disconnect();
    lastConnection = null;
  }
};
/**
 * Handle websocket connection for a game room.
 */
export default class RoomConnection extends WsConnection {
  constructor(roomId: string, type = 'room') {
    super(roomId, type);
  }

  async connect() {
    await super.connect();
    // save last connection and keep only one open (prevent duplicated connection problems!)
    disconnectLastConnection();
    lastConnection = this;
  }

  /**
   * Default message handler for room and user updates
   *
   * @param type message type
   * @param payload payload
   */
  defaultMessageHandler(type: WsMessageType, payload: any) {
    if (this?.users) {
      switch (type) {
        case WsMessageType.ROOM_JOIN:
        case WsMessageType.USER_UPDATE: {
          this.users[payload.user.id] = payload.user;
          break;
        }
        case WsMessageType.ROOM_LEAVE: {
          delete this.users[payload.userId];
          delete this.gameRegistration[payload.userId];
          break;
        }
        case WsMessageType.GAME_REG_UPDATE: {
          // backend will return a object wil all changed userIds
          Object.keys(payload).forEach((userId) => {
            // user left the game registration
            if (!payload[userId]) {
              delete this.gameRegistration[userId];
            } else {
              this.gameRegistration[userId] = payload[userId];
            }
          });
          break;
        }
        case WsMessageType.GAME_STARTED: {
          this.isMatchRunning = true;
          break;
        }
        case WsMessageType.GAME_STOP: {
          this.isMatchRunning = false;
          break;
        }
        case WsMessageType.KEEP_ALIVE: {
          // just for keeping the connection alive
          break;
        }
        default: {
          console.log(`${type} ws messages not implemented`);
        }
      }
    }
  }
}
