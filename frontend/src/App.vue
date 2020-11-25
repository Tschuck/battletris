<template>
  <div class="flex flex-col overflow-hidden text-gray-300 bg-3" style="height: 100vh">
    <nav
      class="flex flex-wrap items-center justify-between p-3 header-bg"
      v-if="loading"
    >
      <img width="42" height="42" src="battletris.svg" />
      <span class="ml-6 text-xl font-semibold">{{
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
import Loading from './components/general/Loading.vue';

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

:root {
  --bg-1: #1a2024;
  --bg-2:  #242c31;
  --bg-3: #3e4649;
  --border: #4b4d4e;
}

.bg-1, .bg-hover-1:hover {
  background-color: var(--bg-1);
}

.bg-2, .bg-hover-2:hover {
  background-color: var(--bg-2);
}

.bg-3, .bg-hover-3:hover {
  background-color: var(--bg-3);
}

.header-bg {
  background-color: var(--bg-1);
  border: var(--border);
}

.button {
  @apply px-4 py-2 font-bold rounded;
  background-color: var(--bg-3);

  &:hover {
    background-color:  var(--bg-1);
  }
}

.button-outline {
  @apply px-4 py-2 font-bold border rounded;
  border: 1px solid var(--bg-3);

  &:hover {
    background-color:  var(--bg-1);
  }
}

.card {
  @apply overflow-hidden rounded;
  background-color: var(--bg-2);

  box-shadow: 2px 5px 3px 0 rgb(0 0 0 / 20%);

  .header {
    @apply p-3 font-bold text-sm header-bg;
  }

  .content {
    @apply px-3 py-3 text-sm;

    &.pt-0 {
      padding-top: 0;
    }
  }
}
</style>
