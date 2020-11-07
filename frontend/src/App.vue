<template>
  <div class="flex flex-col overflow-hidden bg-white" style="height: 100vh">
    <nav
      class="flex flex-wrap items-center justify-between p-3 bg-gray-900"
      v-if="loading"
    >
      <img width="42" height="42" src="@/assets/battletris.svg" />
      <span class="ml-6 text-xl font-semibold text-gray-100">{{
        $t("battletris")
      }}</span>
      <div class="flex-grow" />
    </nav>
    <Loading v-if="loading" />
    <template v-else>
      <RootNav :loading="loading" />
      <div class="flex-grow overflow-auto">
        <router-view />
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { ref } from '@vue/composition-api';

import user from './lib/User';
import roomHandler from './lib/RoomHandler';
import Loading from './components/Loading.vue';
import RootNav from './components/RootNav.vue';

@Component({
  components: {
    Loading,
    RootNav,
  },
  setup() {
    const loading = ref(true);

    (async () => {
      await user.init();
      await roomHandler.load();
      loading.value = false;
    })();

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
