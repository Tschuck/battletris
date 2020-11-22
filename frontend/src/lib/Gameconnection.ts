import WsConnection from './WsConnection';

// only keep the last connection opened
let lastConnection: GameConnection|null;

export const getCurrentConnection = (): GameConnection|null => lastConnection;

export const disconnectLastConnection = () => {
  if (lastConnection) {
    lastConnection.disconnect();
    lastConnection = null;
  }
};
/**
 * Handle websocket connection for a game room.
 */
export default class GameConnection extends WsConnection {
  constructor(roomId: string, type = 'game') {
    super(roomId, type);
  }

  async connect() {
    await super.connect();
    // save last connection and keep only one open (prevent duplicated connection problems!)
    disconnectLastConnection();
    lastConnection = this;
  }
}
