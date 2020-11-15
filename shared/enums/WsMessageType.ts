enum WsMessageType {
  INVALID_MESSAGE = -1,
  ROOM_JOIN = 0,
  ROOM_LEAVE = 1,
  USER_UPDATE = 2,
  CHAT = 3,
  GAME_JOIN = 4,
  GAME_LEAVE = 5,
  GAME_START = 6,
  GAME_STOP = 7,
  GAME_UPDATE = 8,
  GAME_USER_UPDATE = 9,
  TEST = 99,
}

export default WsMessageType;
