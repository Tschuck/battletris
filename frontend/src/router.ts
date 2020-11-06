import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';
import Home from './views/Home.vue';

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: '/',
    component: Home,
  },
  {
    path: '/:roomId',
    props: true,
    component: () => import('./views/Room.vue'),
  },
];

const router = new VueRouter({
  mode: 'history',
  base: '/',
  routes,
});

export default router;
