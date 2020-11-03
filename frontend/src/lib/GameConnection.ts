import axios from 'axios';

import config from '../config';

// only keep the last connection opened
let lastConnection: GameConnection|null;

export const disconnectLastConnection = () => {
  if (lastConnection) {
    lastConnection.disconnect();
    lastConnection = null;
  }
};

/**
 * Handle websocket connection for a game room.
 */
export default class GameConnection {
  static async connect(gameName: string, handler: (data: any) => void) {
    const connection = new GameConnection(gameName, handler);
    await connection.connect();
    return connection;
  }

  /**
   * Connected game name.
   */
  gameName: string;

  /**
   * Open websocket connection.
   */
  connection!: WebSocket;

  /**
   * Function that is called with incoming messages.
   */
  handler: (data: any) => void;

  constructor(gameName: string, handler: (data: any) => void) {
    this.gameName = gameName;
    this.handler = handler;
  }

  /**
   * Join the game (= subscribe for websocket room) and connect to websocket.
   */
  async connect() {
    const { data: { id: connectionId } } = await axios.get(
      `${config.serverUrl}/register`,
      { withCredentials: true },
    );

    // Open new websocket connection and ensure connectionId.
    this.connection = new WebSocket('ws://localhost:3000/ws');
    this.connection.onopen = () => this.send('joinGame', {
      className: window.localStorage.getItem('battletris-class') || 'unknown',
      gameName: this.gameName,
      id: connectionId,
      name: window.localStorage.getItem('battletris-name') || 'unknwwn',
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
