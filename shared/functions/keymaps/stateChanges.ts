/**
 * Mapping of user state changes. Only for user interactions (keys).
 */
export enum UserStateChange {
  TURN_LEFT = 1,
  TURN_RIGHT = 2,
  TURN_180 = 3,
  LEFT = 4,
  RIGHT = 5,
  SOFT_DROP = 6,
  NEXT_TARGET = 7,
  HARD_DROP = 8,
  HOLD = 9,
  ABILITY_1 = 10,
  ABILITY_2 = 11,
  ABILITY_3 = 12,
  ABILITY_4 = 13,
  TARGET_USER_1 = 14,
  TARGET_USER_2 = 15,
  TARGET_USER_3 = 16,
  TARGET_USER_4 = 17,
  TARGET_USER_5 = 18,
}

/**
 * Mapping of game state changes. Only for technical ones (like new block)
 */
export enum GameStateChange {
  LOST = -3,
  EFFECT = -2,
  NEW_BLOCK = -1
}
