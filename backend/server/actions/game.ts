import { v4 as uuidv4 } from 'uuid';

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
  async ({ name }) => ({ game: manager.games[name].data }),
);
