import { RoomWithDataInterface } from '@battletris/shared';
import { getRequest } from './request';

export class RoomHandler {
  rooms: { [id: string]: RoomWithDataInterface } = {};

  async load() {
    this.rooms = await getRequest('rooms');
  }
}

export default new RoomHandler();
