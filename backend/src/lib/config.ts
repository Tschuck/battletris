import path from 'path';

import server from '../server';

const prefix = 'BATTLETRIS_';
const _ = (name: string, defaultValue: any) => {
  const paramName = `${prefix}${name.toUpperCase()}`;
  const value = process.env[paramName];
  if (value || defaultValue) {
    if (defaultValue) {
      server.log.warn(`[CONFIG] using default for: ${paramName}: ${defaultValue}`);
    }

    return value || defaultValue;
  }

  throw new Error(`config ${prefix}${name.toUpperCase()} is missing`);
};

export default {
  cookieSecret: _('COOKIE_SECRET', '6f5af457-b1b6-444d-8488-2d1241d0ad5f'),
  dbPath: _('DB_PATH', path.resolve('../.db.sqlite')),
  defaultGameCount: _('DEFAULT_GAME_COUNT', 5),
  frontendUrl: _('FRONTEND_URL', 'http://localhost:8080'),
  maxGameUsers: 6,
  port: _('PORT', 3000),
  // run game loop every X ms
  gameLoopSpeed: _('GAME_LOOP_SPEED', 1000),
  // "user speed", moves blocks down, ...
  userSpeed: _('USER_SPEED', 1100),
  // increase speed after X ms
  increaseInterval: _('INCREASE_INTERVAL', 30 * 1000),
  // reduce the speed timeout with the amount of ms
  increaseSteps: _('INCREASE_STEPS', 50),
};