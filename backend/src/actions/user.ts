import { v4 as uuidv4 } from 'uuid';
import cookieSignature from 'cookie-signature';

import config from '../lib/config';
import { createEndpoint, ensureUserRegistered } from '../lib/actions.utils';
import ErrorCodes from '../lib/error.codes';
import { User } from '../db';
import Namegen from '../lib/namegen';

const nameGenerator = Namegen.compile("sV i");

/**
 * Use join and leave to reduce data payload during websocket connection data exchange.
 */
createEndpoint(
  'post', '/register',
  {},
  { id: { type: 'string' }},
  async (data, req, reply) => {
    let cookieValue = data.battletris_id || req.cookies.battletris_id;
    if (cookieValue) {
      try {
        cookieValue = await reply.unsignCookie(cookieValue);
      } catch (ex) {
        // invalid cookie?
      }
      // don't allow invalid login
      if (!cookieValue && data.battletris_id) {
        throw new Error(ErrorCodes.CONNECTION_ID_INVALID);
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
    let user: User = await User.findOne(userId);
    if (!user) {
      user = await User.create({
        id: userId,
        className: 'unknown',
        matches: [],
        name: nameGenerator.toString(),
      }).save();
    }

    return user;
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
    const user = await User.create({
      id: userId,
      className: 'unknown',
      matches: [],
      name: nameGenerator.toString(),
    }).save();

    return user;
  }
);
