import { RoomWithDataInterface } from '@battletris/shared';
import { In } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Room, User } from '../db';
import { createEndpoint, ensureUserRegistered } from '../lib/actions.utils';
import RoomHandler, { roomAccess, rooms } from '../server/RoomHandler';

createEndpoint(
  'get', '/rooms',
  {},
  {},
  async () => {
    let rooms = await Room.find();
    return rooms.map((roomEntity) => {
      const startedRoom = rooms[roomEntity.id];

      return {
        ...roomEntity,
        connectionCount: startedRoom?.users?.size || 0,
        isMatchRunning: false,
      };
    });
  },
);

const loadRoomWithData = async (uuid: string): Promise<RoomWithDataInterface> => {
  const room = rooms[uuid];
  const userIds = Object.keys(room?.users) || [];
  const roomEntity = await Room.findOne(uuid);
  const users = await User.find({
    id: In(Array.from(userIds)),
  });
  const userIdMap = {};
  userIds.forEach((id) => userIdMap[id] = users.find((user) => user.id === id));

  return {
    ...roomEntity,
    connectionCount: userIds.length,
    isMatchRunning: false,
    users: userIdMap,
  } as RoomWithDataInterface;
};

createEndpoint(
  'get', '/room/:uuid',
  {
    params: {
      uuid: { type: 'string' },
    },
  },
  {},
  ({ uuid }) => loadRoomWithData(uuid),
);

createEndpoint(
  'get', '/room/:uuid/join',
  {
    params: {
      uuid: { type: 'string' },
    },
  },
  {},
  async ({ uuid }, req) => {
    const userId = await ensureUserRegistered(req);
    await RoomHandler.ensure(uuid);
    const accessKey = `${uuidv4()}|||${uuid}|||${userId}`;
    // add the access key to the room access for 5 seconds
    roomAccess.add(accessKey);
    setTimeout(() => {
      // if the key was not used, clear it and the room
      if (roomAccess.has(accessKey)) {
        roomAccess.delete(accessKey);
        // check if room can be cleared
        if (rooms[uuid] && rooms[uuid].users.size === 0) {
          rooms[uuid].closeRoom();
        }
      }
    }, 5000);

    return {
      joinToken: accessKey,
      room: await loadRoomWithData(uuid),
    };
  },
);