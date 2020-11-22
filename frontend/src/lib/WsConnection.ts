import {
  getStringifiedMessage, parseMessage, RoomWithDataInterface, WsMessageType,
} from '@battletris/shared';
import config from './config';
import { getRequest } from './request';

/**
 * Handle websocket connection for a room and a game.
 */
export default class WsConnection {
  static async connect(roomId: string, type: string) {
    const connection = new WsConnection(roomId, type);
    await connection.connect();
    return connection;
  }

  /** Connected game name */
  roomId: string;

  /** websocket connection => room / game */
  type: string;

  /** Open websocket connection */
  connection!: WebSocket;

  /** Function that is called with incoming messages */
  handlers: ((type: WsMessageType, data: any) => void)[];

  /** Room endpoint result */
  room: RoomWithDataInterface|null = null;

  constructor(roomId: string, type: string) {
    this.handlers = [];
    this.roomId = roomId;
    this.type = type;
  }

  /**
   * Join the game (= subscribe for websocket room) and connect to websocket.
   */
  async connect() {
    const { joinToken, room } = await getRequest(`room/${this.roomId}/join`);
    this.room = room;

    // Open new websocket connection and ensure userId
    this.connection = new WebSocket(`${config.wsUrl}/ws/${this.type}/${joinToken}`);
    this.connection.onmessage = (event) => {
      const { type, payload } = parseMessage(WsMessageType, event.data);
      this.handlers.forEach((handler) => handler(type as WsMessageType, payload));
    };

    // handle user updates and joined / leaved members => use unshift to ensure, that this is the
    // first handler
    this.handlers.unshift((type, payload) => this.defaultMessageHandler(type, payload));
  }

  /**
   * Default message handler for room and user updates
   *
   * @param type message type
   * @param payload payload
   */
  defaultMessageHandler(type: WsMessageType, payload: any) {
    // will be overwritten by specific handler
  }

  /**
   * Disconnect from websocket connection.
   */
  async disconnect() {
    console.log('disconnect');
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
    this.connection.send(getStringifiedMessage(type, payload));
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
