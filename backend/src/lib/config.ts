import path from 'path';

const prefix = 'BATTLETRIS_';
const _ = (name: string, defaultValue: any) => {
  const paramName = `${prefix}${name.toUpperCase()}`;
  const value = process.env[paramName];
  if ((value || defaultValue) !== undefined) {
    // do not log in game process
    if (typeof value === 'undefined' && defaultValue !== undefined
      && process.env.BATTLETRIS_IS_GAME !== 'true') {
      console.warn('\x1b[33m%s\x1b[0m', `[CONFIG] using default for: ${paramName}: ${defaultValue}`);
    }

    try {
      // try to JSON parse it, so we can use json values
      return JSON.parse(value || defaultValue);
    } catch (ex) {
      return value || defaultValue;
    }
  }

  throw new Error(`config ${prefix}${name.toUpperCase()} is missing`);
};

export default {
  /** secret to sign the cookies */
  cookieSecret: _('COOKIE_SECRET', '6f5af457-b1b6-444d-8488-2d1241d0ad5f'),
  /** domain to set the cookie for */
  cookieDomain: _('COOKIE_DOMAIN', 'localhost'),
  /** path to store the db at */
  dbPath: _('DB_PATH', path.resolve('.db.sqlite')),
  /** max amount of default games to initialize on startup */
  defaultGameCount: _('DEFAULT_GAME_COUNT', 5),
  /** frontend running at this url */
  frontendUrl: _('FRONTEND_URL', 'http://localhost:1984'),
  /** max allowed users in game */
  maxGameUsers: 6,
  /** game server starts on port */
  port: process.env.PORT || _('PORT', 2020),
  /** update the users each X ms */
  userUpdateInterval: _('USER_UPDATE_INTERVAL', 100),
  /** "user speed", moves blocks down, ... */
  userSpeed: _('USER_SPEED', 1100),
  /** maximum "user speed" to move the blocks down, ... */
  maxSpeed: _('USER_SPEED', 150),
  /** amount of seconds until the game starts (max =10) */
  startCounter: _('GAME_START_COUNTER', 3),
  /** start sub process in debug mode */
  debugGame: _('DEBUG_GAME', false),
  /** overall log level */
  logLevel: _('LOG_LEVEL', 'debug'),
  /** room keep alive timeout */
  keepAliveTimeout: _('ROOM_KEEP_ALIVE', 15_000),
  /** enables max mana and no mana usage */
  devMode: _('DEV_MODE', true),
  /** enables max mana and no mana usage */
  maxLevel: _('MAX_LEVEL', 15),
  /** amount of rows that each user can resolve, until the max speed is reached */
  maxSpeedRowsPerUser: _('MAX_SPEED_ROWS_PER_USER', 60),
};
