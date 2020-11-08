import { getRequest, postRequest } from './request';

// only keep the last connection opened
let lastConnection: RoomConnection|null;

export const disconnectLastConnection = () => {
  if (lastConnection) {
    lastConnection.disconnect();
    lastConnection = null;
  }
};

export interface RoomInterface {
  name: string;
  users: {
    [id: string]: {
      className: string;
      name: string;
    };
  };
  game: any;
  isMatchRunning?: boolean;
  connectionCount?: boolean;
}

export enum WsMessageType {
  ROOM_JOIN = 0,
  ROOM_LEAVE = 1,
  USER_UPDATE = 2,
  CHAT = 3,
  GAME_JOIN = 4,
  GAME_LEAVE = 5,
  GAME_START = 6,
  GAME_UPDATE = 7,
  GAME_USER_UPDATE = 8,
}

export const getCurrentConnection = (): RoomConnection|null => lastConnection;

/**
 * Handle websocket connection for a game room.
 */
export default class RoomConnection {
  static async connect(roomId: string) {
    const connection = new RoomConnection(roomId);
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
  handlers: ((type: WsMessageType, data: any) => void)[];

  /**
   * Room endpoint result
   */
  room: RoomInterface|null = null;

  constructor(roomId: string) {
    this.roomId = roomId;
    this.handlers = [];
  }

  /**
   * Join the game (= subscribe for websocket room) and connect to websocket.
   */
  async connect() {
    const { id } = await postRequest('register');
    // load current room data
    this.room = await getRequest(`room/${this.roomId}`);

    // Open new websocket connection and ensure userId
    this.connection = new WebSocket('ws://localhost:3000/ws');
    this.connection.onmessage = (event) => {
      const { type, payload } = JSON.parse(event.data);
      this.handlers.forEach((handler) => handler(type, payload));
    };
    this.connection.onopen = () => this.send(WsMessageType.ROOM_JOIN, {
      id,
      roomId: this.roomId,
    });

    // handle user updates and joined / leaved members
    this.onMessage((type, payload) => {
      if (this.room) {
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
    });

    // save last connection and keep only one open (prevent duplicated connection problems!)
    disconnectLastConnection();
    lastConnection = this;
  }

  /**
   * Disconnect from websocket connection.
   */
  async disconnect() {
    this.connection.close();
    // reset values
    this.handlers = [];
    this.room = null;
  }

  /**
   * Send a message to the websocket connection.
   *
   * @param type message type
   * @param payload data to send
   */
  send(type: WsMessageType, payload?: any) {
    this.connection.send(JSON.stringify({
      payload,
      type,
    }));
  }

  /**
   * Add a websocket message handler and returns a unsibscribe function
   *
   * @param handler function that is called on an incoming message
   */
  onMessage(handler: (type: WsMessageType, data: any) => void): () => void {
    this.handlers.push(handler);

    return () => this.handlers.splice(this.handlers.indexOf(handler), 1);
  }
}
