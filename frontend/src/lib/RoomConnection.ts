import { EnrichtedGameUserInterface, RoomWithDataInterface, WsMessageType } from '@battletris/shared';
import { merge } from 'lodash';
import { getRequest, postRequest } from './request';
// eslint-disable-next-line import/no-cycle
import currUser from './User';

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
  room: RoomWithDataInterface|null = null;

  /**
   * Users index in the current game.
   */
  activeIndex = -1;

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
          case WsMessageType.GAME_USER_UPDATE: {
            this.room.game.users = merge(this.room.game.users, payload);
            this.activeIndex = this.room.game.users.findIndex(
              (regUser) => currUser.id.startsWith(regUser?.id),
            );
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
  onMessage(
    handler: (type: WsMessageType, data: any) => void,
    onUnmounted?: Function,
  ) {
    this.handlers.push(handler);
    if (onUnmounted) {
      // remove listeners on unmount
      onUnmounted(() => {
        this.handlers.splice(this.handlers.indexOf(handler), 1);
      });
    }
  }
}
