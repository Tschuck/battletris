import { createEndpoint } from '../lib/actions.utils';
import registry from '../rooms';

// ****************************** Game Handling **************************************************//
createEndpoint(
  'get', '/rooms',
  {},
  {},
  async () => {
    return Object.keys(registry).map((key) => registry[key].entity);
  },
);

createEndpoint(
  'get', '/room/:uuid',
  {
    params: {
      uuid: { type: 'string' },
    },
  },
  {},
  async ({ uuid }) => registry[uuid].entity,
);
