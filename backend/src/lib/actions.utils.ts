import { FastifyRequest, FastifyReply } from 'fastify';
import cookieSignature from 'cookie-signature';
import { ErrorCodes } from '@battletris/shared';

import server from '../server';
import config from './config';

export const createEndpoint = (
  type: string,
  url: string,
  schemaSpecs: any,
  opts: any,
  func: (params: any, req: FastifyRequest, reply: FastifyReply) => any,
) => {
  const specs: any = {
    schema: schemaSpecs,
    ...opts,
  };

  server.log.debug(`[ACTION] register ${type} => ${url}`);
  server[type](
    `/api${url}`,
    specs,
    (request, reply) => func(
      { ...request.query, ...request.params, ...request.body },
      request,
      reply,
    ),
  );
};

export const ensureUserRegistered = async (req: FastifyRequest) => {
  let cookieValue = req.cookies.battletris_id;

  if (cookieValue) {
    try {
      cookieValue = await cookieSignature.unsign(
        cookieValue,
        config.cookieSecret,
      );

      if (!cookieValue) {
        throw new Error(ErrorCodes.CONNECTION_ID_INVALID);
      }
    } catch (ex) {
      throw new Error(ErrorCodes.CONNECTION_ID_INVALID);
    }
  }

  return cookieValue;
};
