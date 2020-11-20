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
  static async connect(roomId: string, type: string) {
    const connection = new RoomConnection(roomId, type);
    await connection.connect();
    return connection;
  }

  activeIndex = -1;

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
    // todo: implement
  }
}
