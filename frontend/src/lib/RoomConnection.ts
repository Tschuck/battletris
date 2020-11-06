import { postRequest } from './request';

// only keep the last connection opened
let lastConnection: RoomConnection|null;

export const disconnectLastConnection = () => {
  if (lastConnection) {
    lastConnection.disconnect();
    lastConnection = null;
  }
};

/**
 * Handle websocket connection for a game room.
 */
export default class RoomConnection {
  static async connect(roomId: string, handler: (data: any) => void) {
    const connection = new RoomConnection(roomId, handler);
    await connection.connect();
    return connection;
  }

  /**
   * Connected game name.
   */
  roomId: string;

  /**
   * Open websocket connection.
   */
  connection!: WebSocket;

  /**
   * Function that is called with incoming messages.
   */
  handler: (data: any) => void;

  constructor(roomId: string, handler: (data: any) => void) {
    this.roomId = roomId;
    this.handler = handler;
  }

  /**
   * Join the game (= subscribe for websocket room) and connect to websocket.
   */
  async connect() {
    const { id } = await postRequest('register');

    // Open new websocket connection and ensure userId
    this.connection = new WebSocket('ws://localhost:3000/ws');
    this.connection.onopen = () => this.send('joinGame', {
      id,
      roomId: this.roomId,
    });
    this.connection.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handler(data);
    };

    // save last connection and keep only one open (prevent duplicated connection problems!)
    disconnectLastConnection();
    lastConnection = this;
  }

  /**
   * Disconnect from websocket connection.
   */
  async disconnect() {
    this.connection.close();
  }

  /**
   * Send a message to the websocket connection.
   *
   * @param type message type
   * @param payload data to send
   */
  send(type: string, payload: any) {
    this.connection.send(JSON.stringify({
      payload,
      type,
    }));
  }
}
