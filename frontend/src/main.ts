import Vue from 'vue';

import App from './App.vue';
import router from './router';
import vuei18n from './i18n';

Vue.config.productionTip = false;

new Vue({
  i18n: vuei18n,
  router,
  render: (h) => h(App),
}).$mount('#app');
