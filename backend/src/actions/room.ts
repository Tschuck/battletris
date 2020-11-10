import { GameStatus, RoomWithDataInterface } from '@battletris/shared';
import { In } from 'typeorm';
import { User } from '../db';
import { createEndpoint } from '../lib/actions.utils';
import registry from '../rooms';

// ****************************** Game Handling **************************************************//
createEndpoint(
  'get', '/rooms',
  {},
  {},
  async () => {
    const rooms = {};

    Object.keys(registry).map((key) => {
      const room = registry[key];
      const { entity } = room;

      rooms[key] = {
        ...entity,
        connectionCount: room.wsConnections.length,
        isMatchRunning: room.gameBridge.data.status === GameStatus.STARTED,
      };
    });

    return rooms;
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
      game: room.gameBridge.data,
      isMatchRunning: room.gameBridge.data.status === GameStatus.STARTED,
      users: userIdMap,
    } as RoomWithDataInterface;
  },
);
