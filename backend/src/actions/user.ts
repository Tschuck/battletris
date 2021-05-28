import { ErrorCodes, WsMessageType } from '@battletris/shared';
import cookieSignature from 'cookie-signature';
import config from '../lib/config';
import { v4 as uuidv4 } from 'uuid';
import { Match, User } from '../db';
import { createEndpoint, ensureUserRegistered } from '../lib/actions.utils';
import Namegen from '../lib/namegen';
import { rooms } from '../server/RoomHandler';
import { createQueryBuilder } from 'typeorm';

const nameGenerator = Namegen.compile("sV i");

/**
 * Use join and leave to reduce data payload during websocket connection data exchange.
 */
createEndpoint(
  'post', '/register',
  {},
  {
    id: { type: 'string' },
    exportAuthToken: { type: 'string' },
  },
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
      domain: config.cookieDomain,
      signed: true,
      httpOnly: false,
    });

    const returnVal: any = { id: cookieValue };
    if (data.exportAuthToken) {
      returnVal.authToken = cookieSignature.sign(cookieValue, config.cookieSecret);
    }

    // returned signed cookie. So we can omit cookie parsing in ui
    return returnVal;
  }
);

createEndpoint(
  'get', '/user',
  {},
  {},
  async (data, req, reply) => {
    const userId = await ensureUserRegistered(req);

    // ensure default user
    let user: User = await User.findOne(userId, {
      relations: ['keyMaps'],
    });
    if (!user) {
      user = await User.create({
        id: userId,
        className: 'unknown',
        matches: [],
        name: nameGenerator.toString(),
      }).save();
      user = await User.findOne(userId, {
        relations: ['keyMaps'],
      });
    }

    return user;
  }
);

createEndpoint(
  'get', '/user/matches',
  {},
  {},
  async (data, req, reply) => {
    const userId = await ensureUserRegistered(req);
    const matches = await createQueryBuilder(Match, 'match')
      .leftJoin(
        'match.users',
        'user',
        'user.id = :userId',
        { userId },
      )
      .where('user.id = :userId', { userId })
      .take(10)
      .getMany();

    // parse match stats object
    return (matches || []).map((match) => ({
      ...match,
      ...JSON.parse(match.stats),
    }));
  }
);

createEndpoint(
  'post', '/user',
  {},
  {},
  async (data, req) => {
    const userId = await ensureUserRegistered(req);

    // update user name
    const user = await User.create({
      activeKeyMap: data.activeKeyMap || 'default',
      className: data.className,
      id: userId,
      matches: [],
      name: data.name || nameGenerator.toString(),
    }).save();

    // update current ws connection
    if (data.roomId && rooms[data.roomId]) {
      rooms[data.roomId].wsBroadcast(WsMessageType.USER_UPDATE, { user });
    }

    return user;
  }
);
