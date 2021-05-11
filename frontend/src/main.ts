import Vue from 'vue';
import VueCompositionApi from '@vue/composition-api';
import VueCountdown from '@chenfengyuan/vue-countdown';
import VSelect from 'vue-select';
import 'vue-select/dist/vue-select.css';
import './style/vue-slider.css';

import App from './App.vue';
import router from './router';
import vuei18n from './i18n';
import './lib/icons';

Vue.config.productionTip = false;

// plugins
Vue.use(VueCompositionApi);
Vue.component(VueCountdown.name, VueCountdown);
Vue.component('VSelect', VSelect);

new Vue({
  i18n: vuei18n,
  router,
  render: (h) => h(App),
}).$mount('#app');
