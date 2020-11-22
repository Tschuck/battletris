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
  activeIndex = -1;

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
    if (this?.room) {
      switch (type) {
        case WsMessageType.ROOM_JOIN:
        case WsMessageType.USER_UPDATE: {
          this.room.users[payload.userId] = payload.user;
          break;
        }
        case WsMessageType.ROOM_LEAVE: {
          delete this.room.users[payload.userId];
          break;
        }
        default: {
          console.log(`${type} ws messages not implemented`);
        }
      }
    }
  }
}
