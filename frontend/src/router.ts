import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  { path: '/', component: () => import('./views/StartPage.vue') },
  { path: '/mode', component: () => import('./views/Mode.vue') },
  { path: '/tutorial', component: () => import('./views/tutorial/Tutorial.vue') },
  { path: '/laboratory', component: () => import('./views/Laboratory.vue') },
  { path: '/multi-player', component: () => import('./views/MultiPlayer.vue') },
  {
    path: '/multi-player/:roomId',
    component: () => import('./views/Room.vue'),
    props: true,
  },
  { path: '/settings', component: () => import('./views/Settings.vue') },
  { path: '/versions', component: () => import('./views/Versions.vue') },
];

const router = new VueRouter({
  mode: 'history',
  base: '/',
  routes,
});

export default router;
