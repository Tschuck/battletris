import { v4 as uuidv4 } from 'uuid';
import cookieSignature from 'cookie-signature';

import config from '../config';
import { createEndpoint } from './utils';

/**
 * Use join and leave to reduce data payload during websocket connection data exchange.
 */
createEndpoint(
  'get', '/register',
  {},
  { id: { type: 'string' }},
  async (data, req, reply) => {
    let cookieValue;
    if (req.cookies.battletris_id) {
      try {
        cookieValue = await reply.unsignCookie(req.cookies.battletris_id);
      } catch (ex) {
        // expired, invalid what ever
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