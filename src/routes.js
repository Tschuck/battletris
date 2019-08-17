import Lobby from './components/tavern/tavern.vue';
import Battlefield from './components/battlefield/battlefield.vue';
import Analytics from './components/analytics/analytics.vue';

const routes = [
  { path: '/', redirect: 'tavern' },
  { path: '/analytics', component: Analytics },
  { path: '/battlefield/:room', component: Battlefield },
  { path: '/tavern', component: Lobby },
];

export default routes;
