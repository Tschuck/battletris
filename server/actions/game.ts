import server from '../server';
import { createEndpoint } from './utils';
import manager from '../manager';

createEndpoint(
  'get', '/games',
  {},
  {},
  async () => ({ games: manager.games }),
);

createEndpoint(
  'get', '/game/:name',
  { name: { type: 'string' } },
  {},
  async ({ name }) => ({ game: manager.games[name] }),
);

createEndpoint(
  'post', '/game/:name',
  { name: { type: 'string' } },
  {},
  async ({ name }) => {
    await manager.create(name);
    return manager.games[name];
  },
);

createEndpoint(
  'delete', '/game/:name',
  { name: { type: 'string' } },
  {},
  async ({ name }) => {
    await manager.delete(name);
    return manager.games[name];
  },
);