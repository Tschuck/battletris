// !IMPORTANT!: Import this d.ts file within your vue tsconfig to fix "cannot find module" errors
// while importing vue files
declare module '*.vue' {
  import Vue from 'vue';
  import VueRouter from 'vue-router';
  import Vuex from 'vuex';
  import vuexI18n from 'vuex-i18n';

  class BattletrisVue extends Vue {
    $i18n: vuexI18n;
    $router: VueRouter;
    $store: Vuex;
    $t: any;
  }

  export default BattletrisVue;
}

