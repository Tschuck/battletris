enum ProcessMessageType {
  INVALID_MESSAGE = -1,
  LOG = 0,
  JOIN_WS = 1,
  STOP = 2,
  STOPPED = 3,
  GAME_USER_UPDATE = 4,
  TEST = 99,
}

export default ProcessMessageType;
