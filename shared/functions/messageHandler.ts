import ProcessMessageType from '../enums/ProcessMessageType';
import WsMessageType from '../enums/WsMessageType';

export interface ParsedMessage {
  type: ProcessMessageType|WsMessageType;
  payload: any;
}
export const encodingFormat = 'utf-16le';

/**
 * Parse a stringified message that was send via websocket or via process.
 *
 * @param typeMapping mapping to check for type validity (either process / ws message)
 * @param message message to parse
 */
export function parseMessage(
  typeMapping: typeof ProcessMessageType| typeof WsMessageType,
  message: string,
): ParsedMessage {
  let result = { type: WsMessageType.INVALID_MESSAGE, payload: {} };

  try {
    const parsed = JSON.parse(message);
    if (typeMapping[parsed[0]]) {
      result = {
        type: parsed[0],
        payload: parsed[1],
      };
    }
  } catch (ex) {
    // could parse
  }

  return result;
}

/**
 * Prepare a message to be sent out.
 * @param type process message type or a ws message type
 * @param payload payload to attach
 */
export function getStringifiedMessage(type: ProcessMessageType|WsMessageType, payload: any): any {
  return JSON.stringify([
    type,
    payload,
  ]);
}
