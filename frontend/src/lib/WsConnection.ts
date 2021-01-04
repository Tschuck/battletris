import {
  GameUserStatus,
  getStringifiedMessage, parseMessage, RoomWithDataInterface, UserInterface, WsMessageType,
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

  /** Open websocket ws */
  ws!: WebSocket;

  /** Function that is called with incoming messages */
  handlers: ((type: WsMessageType, data: any) => void)[];

  /** amount of connected users */
  connectionCount = 0;

  /** is currently a match running? */
  isMatchRunning = false;

  /** room name */
  name = '';

  /** all users with their name, className, ... config  */
  users: Record<string, UserInterface> = {};

  /** all in the room registered users for a game */
  gameRegistration: Record<string, GameUserStatus> = {};

  /** do not send messages, if the socket was closed */
  closed = false;

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
    this.updateRoomValues(room);

    // Open new websocket connection and ensure userId
    this.ws = new WebSocket(`${config.wsUrl}/ws/${this.type}/${joinToken}`);
    this.ws.onmessage = (event) => {
      const fr = new FileReader();
      fr.onload = () => {
        const { type, payload } = parseMessage(WsMessageType, fr.result as string);
        this.handlers.forEach((handler) => handler(type as WsMessageType, payload));
      };
      fr.readAsText(event.data);
    };

    // handle user updates and joined / leaved members => use unshift to ensure, that this is the
    // first handler
    this.handlers.unshift((type, payload) => this.defaultMessageHandler(type, payload));

    // do not send messages, if socket is closed
    this.ws.onclose = () => {
      this.closed = true;
    };
  }

  /**
   * Default message handler for room and user updates
   *
   * @param type message type
   * @param payload payload
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  defaultMessageHandler(type: WsMessageType, payload: any) {
    // will be overwritten by specific handler
  }

  /**
   * Disconnect from websocket connection.
   */
  async disconnect() {
    this.closed = true;
    this.ws.close();
    // reset values
    this.handlers = [];
    // reset room values
    this.updateRoomValues();
  }

  /**
   * Send a message to the websocket connection.
   *
   * @param type message type
   * @param payload data to send
   */
  send(type: WsMessageType, payload?: any) {
    try {
      if (!this.closed && this.ws.readyState === this.ws.OPEN) {
        this.ws.send(getStringifiedMessage(type, payload));
      }
    } catch (ex) {
      // maybe fix remote "websocket is already in closing state"
      console.error(ex);
    }
  }

  /**
   * Add a websocket message handler and returns a unsibscribe function
   *
   * @param handler function that is called on an incoming message
   */
  onMessage(
    handler: (type: WsMessageType, data: any) => void,
    onUnmounted?: Function,
  ): () => void {
    this.handlers.push(handler);
    // remove on message handler
    const unMount = () => this.handlers.splice(this.handlers.indexOf(handler), 1);

    // if component unmounted is bind, remove the function
    if (onUnmounted) {
      // remove listeners on unmounted
      onUnmounted(unMount);
    }

    return unMount;
  }

  /**
   * Writes all values from the loaded backend room into the room connection instance.
   * @param room loaded room object from backend
   */
  updateRoomValues(room?: RoomWithDataInterface) {
    this.connectionCount = room?.connectionCount || 0;
    this.isMatchRunning = room?.isMatchRunning || false;
    this.name = room?.name || '';
    this.users = room?.users || {};
    this.gameRegistration = room?.gameRegistration || {};
  }
}
