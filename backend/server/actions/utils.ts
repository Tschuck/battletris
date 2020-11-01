import { FastifyRequest, FastifyReply } from 'fastify';

import server from '../server';

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

  server.log.info(`[ACTION] register ${type} => ${url}`);
  server[type](
    url,
    specs,
    (request, reply) => func(request.params, request, reply),
  );
};
