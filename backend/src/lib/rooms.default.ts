import * as Throttle from 'promise-parallel-throttle';
import { Room } from '../db';

export default async () => {
  const defaultRooms = [
    { id: '5bee984b-1cdb-4960-b2d6-301dae3dbe4b', name: 'sayie cheese', },
    { id: '32c670a8-68a7-45d4-8284-6cfaf21f1663', name: 'ardea thimble', },
    { id: '41bbeb40-2262-428c-b092-a27d0f8cb8c5', name: 'onea loaf', },
    { id: '6e6de733-461f-4150-85cb-09d93875fbf4', name: 'elmeu clot', },
    { id: '4b21cd32-129f-4d2d-8e2e-4cea7a07a53c', name: 'uskea beef', },
    { id: '8a41ca4a-f93c-4caf-8a0d-738089a1de36', name: 'hatai dork', },
    { id: '9c7d9ffc-fbf5-4cd1-9695-a537a3b736f0', name: 'eldei head', },
    { id: 'f1ec6817-02c7-4f6d-b6d4-9bb25ee1cbf0', name: 'baney bum', },
    { id: 'a24d17fc-a9c4-4102-a624-58956e48f0b7', name: 'loria wad', },
    { id: 'fa1927a3-d9f1-4e3a-be99-1d21fa3746df', name: 'quaay dolt', },
    { id: '4d4a4c39-021e-4d50-8f95-cffe6ff6d6e6', name: 'banu snark', },
    { id: '4bdc6d24-d98a-49cd-9fec-59f55f90ec92', name: 'esti beef', },
    { id: '7143fa6e-ead4-45dc-be8d-59e04fba4fea', name: 'rynee wipe', },
    { id: 'fdd82a57-40a1-4d52-8d78-e2d58afb221f', name: 'ire muck', },
    { id: '13010513-0543-4694-861f-4ded046e5587', name: 'radei beef', },
    { id: '6e8bd30e-279f-4d16-ad0f-2289f4899b3e', name: 'enda loaf', },
    { id: '9f999fa9-92d5-441a-b6d3-28e1293ed55e', name: 'mose dork', },
    { id: 'f40f2ff2-0be4-450c-b72c-48f2df0344d5', name: 'ingo munch', },
    { id: 'fdb43132-202f-4ce1-b822-234a1f9621c6', name: 'lorea clown', },
    { id: 'f128d101-f341-4e30-8a86-421369067459', name: 'ougho face', },
  ]

  await Throttle.all(defaultRooms.map((room) => async () => {
    await Room.create(room).save();
  }), { maxInProgress: 10, failFast: true });
}
