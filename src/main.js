import BootstrapVue from 'bootstrap-vue'
import Vue from 'vue';
import VueRouter from 'vue-router';
import Vuex from 'vuex';
import vuexI18n from 'vuex-i18n';
import { Component } from 'vue-property-decorator';

import * as battletris from './battletris';
import components from './components/registry';
import en from './i18n/en';
import Main from './components/main/main.vue';
import routes from './routes';

import './scss/index.scss';

// set active them
battletris.setTheme();

// register dependencies
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

// register all battletris components
components.forEach((def) => Vue.component(def.name, def.component));

new Vue({
  router,
  store,
  render: (h) => h(Main)
}).$mount('#app');
