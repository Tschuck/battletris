import Vue from 'vue';
import vuexI18n from 'vuex-i18n';
import VueRouter from 'vue-router';
import Vuex from 'vuex';
import { Component } from 'vue-property-decorator';

import Main from './components/main/main.vue';
import en from './i18n/en';
import routes from './routes';
import * as battletris from './battletris';

import './scss/index.scss';

battletris.setTheme();

Vue.use(Vuex);
Vue.use(VueRouter);

const store = new Vuex.Store({ });

// register i18n
Vue.use(vuexI18n.plugin, store);
Vue.i18n.add('en', en);
Vue.i18n.fallback('en');
Vue.i18n.set('en');

// create the instances for those 3
const router = new VueRouter({ routes: routes });

new Vue({
  router,
  store,
  render: (h) => h(Main)
}).$mount('#app');
