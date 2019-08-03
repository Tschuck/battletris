import BootstrapVue from 'bootstrap-vue'
import Vue from 'vue';
import VueRouter from 'vue-router';
import Vuex from 'vuex';
import vuexI18n from 'vuex-i18n';
import { Component } from 'vue-property-decorator';

import Main from './components/main/main.vue';
import en from './i18n/en';
import routes from './routes';
import * as battletris from './battletris';

import './scss/index.scss';

battletris.setTheme();

Vue.use(BootstrapVue)
Vue.use(VueRouter);
Vue.use(Vuex);

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
