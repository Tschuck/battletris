import { In } from 'typeorm';
import { User } from '../db';
import { GameStatus } from '../game/helpers/interfaces';
import { createEndpoint } from '../lib/actions.utils';
import registry from '../rooms';

// ****************************** Game Handling **************************************************//
createEndpoint(
  'get', '/rooms',
  {},
  {},
  async () => {
    return Object.keys(registry).map((key) => {
      const room = registry[key];
      const { entity } = room;

      return {
        ...entity,
        connectionCount: room.wsConnections.length,
        isMatchRunning: room.gameBridge.data.status === GameStatus.STARTED,
      };
    });
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
  async ({ uuid }) => {
    const room = registry[uuid];
    const roomEntity = registry[uuid].entity;
    const userIds = room.wsConnections.map((connection) => connection.userId);
    const users = await User.find({
      id: In(userIds),
    });
    const userIdMap = {};
    userIds.forEach((id) => userIdMap[id] = users.find((user) => user.id === id));

    return {
      ...roomEntity,
      connectionCount: userIds.length,
      isMatchRunning: room.gameBridge.data.status === GameStatus.STARTED,
      users: userIdMap,
    };
  },
);
