import { createEndpoint } from './utils';
import manager from '../gameManager';

// ****************************** Game Handling **************************************************//
createEndpoint(
  'get', '/games',
  {},
  {},
  async () => ({ games: manager.games }),
);

createEndpoint(
  'get', '/game/:name',
  {
    params: {
      name: { type: 'string' },
    },
  },
  {},
  async ({ name }) => ({ game: manager.games[name] }),
);

createEndpoint(
  'post', '/game/:name',
  {
    params: {
      name: { type: 'string' },
    },
  },
  {},
  async ({ name }) => {
    await manager.create(name);
    return manager.games[name];
  },
);

createEndpoint(
  'delete', '/game/:name',
  {
    params: {
      name: { type: 'string' },
    },
  },
  {},
  async ({ name }) => {
    await manager.delete(name);
    return manager.games[name];
  },
);
