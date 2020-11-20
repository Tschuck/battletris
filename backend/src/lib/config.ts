import path from 'path';

const prefix = 'BATTLETRIS_';
const _ = (name: string, defaultValue: any) => {
  const paramName = `${prefix}${name.toUpperCase()}`;
  const value = process.env[paramName];
  if ((value || defaultValue) !== undefined) {
    // do not log in game process
    if (defaultValue !== undefined && process.env.BATTLETRIS_IS_GAME !== 'true') {
      console.warn('\x1b[33m%s\x1b[0m: ', `[CONFIG] using default for: ${paramName}: ${defaultValue}`);
    }

    return value || defaultValue;
  }

  throw new Error(`config ${prefix}${name.toUpperCase()} is missing`);
};

export default {
  // secret to sign the cookies
  cookieSecret: _('COOKIE_SECRET', '6f5af457-b1b6-444d-8488-2d1241d0ad5f'),
  // path to store the db at
  dbPath: _('DB_PATH', path.resolve('../.db.sqlite')),
  // max amount of default games to initialize on startup
  defaultGameCount: _('DEFAULT_GAME_COUNT', 5),
  // frontend running at this url
  frontendUrl: _('FRONTEND_URL', 'http://localhost:1984'),
  // max allowed users in game
  maxGameUsers: 6,
  // game server starts on port
  port: _('PORT', 2020),
  // run game loop every X ms
  gameLoopSpeed: _('GAME_LOOP_SPEED', 1000),
  // "user speed", moves blocks down, ...
  userSpeed: _('USER_SPEED', 1100),
  // increase speed after X ms
  increaseInterval: _('INCREASE_INTERVAL', 30 * 1000),
  // reduce the speed timeout with the amount of ms
  increaseSteps: _('INCREASE_STEPS', 50),
  // amount of seconds until the game starts (max =10)
  startCounter: _('GAME_START_COUNTER', 10),
  // start sub process in debug mode
  debugGame: _('DEBUG_GAME', false),
  // overall log level
  logLevel: _('LOG_LEVEL', 'debug'),
};
