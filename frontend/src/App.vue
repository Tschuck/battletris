<template>
  <div>
    <RootNav ref="rootNav" :loading="loading" />
    <Loading v-if="loading" />
    <router-view v-else />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { ref } from '@vue/composition-api';

import user from './lib/User';
import Loading from './components/Loading.vue';
import RootNav from './components/RootNav.vue';

@Component({
  components: {
    Loading,
    RootNav,
  },
  setup() {
    const loading = ref(true);
    const rootNav = ref<any>(null);
    user.init().then(() => {
      loading.value = false;
      // eslint-disable-next-line no-unused-expressions
      rootNav.value?.ensureUserValues();
    });

    return {
      loading,
    };
  },
})
export default class Home extends Vue {}
</script>

<style lang="postcss">
@tailwind base;
@tailwind components;
@tailwind utilities;
</style>
