import { FastifyRequest, FastifyReply } from 'fastify';

import server from '../server';

export const createEndpoint = (
  type: string,
  url: string,
  params: any,
  payload: any,
  func: (params: any, req: FastifyRequest, reply: FastifyReply) => any,
) => {
  const specs: any = {
    schema: {
      params,
      response: { },
      ...(type === 'get' ? { query: payload } : { body: payload }),
    },
  };

  server.log.info(`[ACTION] register ${type} => ${url}`);
  server[type](
    url,
    specs,
    (request, reply) => func(request.params, request, reply),
  );
};
