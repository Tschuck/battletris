import { v4 as uuidv4 } from 'uuid';

import server from './server';

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
  defaultGameCount: _('DEFAULT_GAME_COUNT', 10),
  frontendUrl: _('FRONTEND_URL', 'http://localhost:8080'),
  port: _('PORT', 3000),
};
