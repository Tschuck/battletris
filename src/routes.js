import Lobby from './components/tavern/tavern.vue';
import Battlefield from './components/battlefield/battlefield.vue';

const routes = [
  { path: '/', redirect: 'tavern' },
  { path: '/tavern', component: Lobby },
  { path: '/battlefield/:room', component: Battlefield }
];

export default routes;
