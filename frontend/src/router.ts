import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: '/',
    component: () => import('./views/StartPage.vue'),
  }, {
    path: '/mode',
    component: () => import('./views/Mode.vue'),
  },
  {
    component: () => import('./views/Room.vue'),
    name: 'room',
    path: '/:roomId',
    props: true,
  },
];

const router = new VueRouter({
  mode: 'history',
  base: '/',
  routes,
});

export default router;
