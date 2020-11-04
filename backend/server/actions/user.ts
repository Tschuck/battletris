import { v4 as uuidv4 } from 'uuid';
import cookieSignature from 'cookie-signature';

import config from '../config';
import { createEndpoint, ensureUserRegistered } from './utils';
import ErrorCodes from '../error.codes';
import { dbs, saveDb } from '../dbManager';
import Namegen from '../utils/namegen';

const nameGenerator = Namegen.compile("sV i");

/**
 * Use join and leave to reduce data payload during websocket connection data exchange.
 */
createEndpoint(
  'get', '/register',
  {},
  { id: { type: 'string' }},
  async (data, req, reply) => {
    let cookieValue = data.battletris_id || req.cookies.battletris_id;
    if (cookieValue) {
      try {
        cookieValue = await reply.unsignCookie(cookieValue);
      } catch (ex) {
        if (data.battletris_id) {
          throw new Error(ErrorCodes.CONNECTION_ID_INVALID);
        }
      }
    }

    if (!cookieValue) {
      cookieValue = uuidv4();
    }

    reply.setCookie('battletris_id', cookieValue, {
      domain: 'localhost',
      signed: true,
      httpOnly: false,
    });

    // returned signed cookie. So we can ommit cookie parsing in ui
    return {
      id: cookieSignature.sign(cookieValue, config.cookieSecret),
    };
  }
);

createEndpoint(
  'get', '/user',
  {},
  {},
  async (data, req, reply) => {
    const userId = await ensureUserRegistered(req);

    // ensure default user
    if (!dbs.users[userId]) {
      dbs.users[userId] = {
        className: 'unknown',
        matches: [],
        name: nameGenerator.toString(),
      };
      await saveDb('users');
    }

    return dbs.users[userId];
  }
);

createEndpoint(
  'post', '/user',
  {
    name: { type: 'string' }
  },
  {},
  async (data, req, reply) => {
    const userId = await ensureUserRegistered(req);

    // update user name
    const user = dbs.users[userId] || {};
    dbs.users[userId] = {
      className: user.className || 'unknown',
      matches: user.matches || [],
      name: data.name || user.name || nameGenerator.toString(),
    };

    return dbs.users[userId];
  }
);
