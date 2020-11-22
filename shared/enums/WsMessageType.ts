enum WsMessageType {
  ERROR = -2,
  INVALID_MESSAGE = -1,
  ROOM_JOIN = 0,
  ROOM_LEAVE = 1,
  USER_UPDATE = 2,
  CHAT = 3,
  GAME_JOIN = 4,
  GAME_LEAVE = 5,
  GAME_ACCEPT = 6,
  GAME_CANCEL = 7,
  GAME_UPDATE = 8,
  GAME_REG_UPDATE = 9,
  GAME_CHANGE = 10,
  GAME_STATS = 20,
  TEST = 99,
}

export default WsMessageType;
