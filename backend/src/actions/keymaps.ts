import { User, UserKeyMap } from '../db';
import { createEndpoint, ensureUserRegistered } from '../lib/actions.utils';
import { v4 as uuidv4, validate as validateUuid } from 'uuid';

createEndpoint(
  'post', '/keymap',
  {},
  {},
  async (data, req) => {
    const userId = await ensureUserRegistered(req);
    const {
      activeKeyMap,
      keyMaps,
    } = data;
    const user = await User.findOne(userId);
    user.activeKeyMap = activeKeyMap;

    keyMaps.forEach((keyMap: UserKeyMap) => {
      if (!validateUuid(keyMap.id)) {
        let newId = uuidv4();
        if (activeKeyMap === keyMap.id) {
          user.activeKeyMap = newId;
        }
        keyMap.id = newId;
      }
    });

    await Promise.all(keyMaps.map((keyMap: UserKeyMap) => UserKeyMap
      .create({
        ...keyMap,
        user,
      })
      .save()
    ));
    await user.save();
    return {};
  }
);


createEndpoint(
  'post', '/keymap-delete',
  {},
  {},
  async (data, req) => {
    const userId = await ensureUserRegistered(req);
    const { keyMap } = data;

    await UserKeyMap.delete(keyMap);
    const user = await User.findOne(userId, {
      relations: ['keyMaps'],
    });

    if (user.activeKeyMap === keyMap) {
      user.activeKeyMap = 'default';
      await user.save();
    }

    return {};
  }
);
