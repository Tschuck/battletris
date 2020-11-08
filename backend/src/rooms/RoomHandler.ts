import { Room }  from '../db';
import ErrorCodes from '../lib/error.codes';
import GameBridge from '../game/GameBridge';
import roomRegistry  from './registry';
import server from '../server';
import WsConnection, { WsMessageType } from './WsConnection';

export default class RoomHandler {
  /**
   * Open wsConnections
   */
  wsConnections: WsConnection[] = [];

  /**
   * room data / configuration
   */
  entity : Room;

  /**
   * game bridge for handling a game process
   */
  gameBridge: GameBridge;

  constructor(entity: Room) {
    this.entity = entity;
    if (roomRegistry[entity.id]) {
      throw new Error(ErrorCodes.ROOM_STARTED);
    }
    roomRegistry[entity.id] = this;
    this.gameBridge = new GameBridge(this.entity.id);
    this.log('info', `started "${this.entity.name}"`);
  }

  /**
   * Add connection to the game process. (used for message broadcasting)
   *
   * @param connection websocket connection class instance
   */
  addWsConnection(connection: WsConnection) {
    this.log('debug', `added connection: ${connection.userId}`);
    this.wsConnections.push(connection);
  }

  /**
   * Send a type and a payload to all registered wsConnections.
   *
   * @param type type to send
   * @param payload payload to send
   */
  async broadcastToWs(type: WsMessageType, payload: any) {
    this.log('debug', `broadcast [${type}]: ${payload}`);
    await Promise.all(this.wsConnections.map(
      (connection) => connection.send(type, payload),
    ));
  }

  /**
   * Log a message in context of a room.
   *
   * @param type server.log type
   * @param message message to log
   */
  log(type: string, message: string) {
    server.log[type](`[${this.entity.id}] ${message}`);
  }

  /**
   * Remove connection from the game process.
   *
   * @param connection websocket connection class instance
   */
  async removeWsConnection(connection: WsConnection) {
    this.wsConnections.splice(this.wsConnections.findIndex((c) => c === connection), 1);
    await this.gameBridge.handleWsMessage(
      connection,
      WsMessageType.GAME_LEAVE,
      { userId: connection.userId },
    );
    await this.broadcastToWs(WsMessageType.ROOM_LEAVE, { userId: connection.userId });
    this.log('debug', `removed connection: ${connection.userId}`);
  }

  async handleMessage(
    connection: WsConnection,
    type: WsMessageType,
    payload: any,
  ) {
    switch (type) {
      case WsMessageType.CHAT: {
        this.broadcastToWs(WsMessageType.CHAT, {
          message: payload,
          id: connection.userId,
        });
        break;
      }
      case WsMessageType.USER_UPDATE: {
        // TODO: do not update user, when user is in battle
        this.broadcastToWs(WsMessageType.USER_UPDATE, {
          userId: connection.userId,
          user: payload,
        });
        break;
      }
      case WsMessageType.GAME_JOIN: {
        await this.gameBridge.handleWsMessage(connection, type, payload);
        break;
      }
      case WsMessageType.GAME_LEAVE: {
        await this.gameBridge.handleWsMessage(connection, type, payload);
        break;
      }
      default: {
        console.log(`ws type: "${type}" not implemented`);
        break;
      }
    }
  }
}
