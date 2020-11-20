<template>
  <div class="flex flex-col overflow-hidden bg-white" style="height: 100vh">
    <nav
      class="flex flex-wrap items-center justify-between p-3 bg-gray-900"
      v-if="loading"
    >
      <img width="42" height="42" src="battletris-light.svg" />
      <span class="ml-6 text-xl font-semibold text-gray-100">{{
        $t("battletris")
      }}</span>
      <div class="flex-grow" />
    </nav>
    <Loading v-if="loading" />
    <router-view v-else />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { ref } from '@vue/composition-api';

import user from './lib/User';
import Loading from './components/Loading.vue';

@Component({
  components: {
    Loading,
  },
  setup() {
    const loading = ref(true);

    (async () => {
      await user.init();
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

.button {
  @apply px-4 py-2 font-bold text-white bg-blue-900 rounded;

  &:hover {
    @apply bg-blue-800;
  }
}

.button-outline {
  @apply px-4 py-2 font-bold text-blue-900 border border-blue-900 rounded;

  &:hover {
    @apply bg-blue-800 text-white;
  }
}

.card {
  @apply overflow-hidden rounded;

  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);

  .header {
    @apply p-3 font-bold text-white bg-gray-900 text-sm;
  }

  .content {
    @apply px-3 py-3 text-sm;
  }
}
</style>
