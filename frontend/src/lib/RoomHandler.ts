import { getRequest } from './request';

interface Room {
  name: string;

  id: string;
}

export class RoomHandler {
  rooms: Room[] = [];

  async load() {
    this.rooms = await getRequest('rooms');
  }
}

export default new RoomHandler();
