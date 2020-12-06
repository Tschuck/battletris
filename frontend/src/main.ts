import Vue from 'vue';
import VueCompositionApi from '@vue/composition-api';
import VueCountdown from '@chenfengyuan/vue-countdown';

import App from './App.vue';
import router from './router';
import vuei18n from './i18n';
import './lib/icons';

// automatic forward to battletris.de
if (window.location.host === 'battletris.herokuapp.com') {
  window.location.href = 'https://battletris.de';
} else {
  Vue.config.productionTip = false;

  // plugins
  Vue.use(VueCompositionApi);
  Vue.component(VueCountdown.name, VueCountdown);

  new Vue({
    i18n: vuei18n,
    router,
    render: (h) => h(App),
  }).$mount('#app');
}
