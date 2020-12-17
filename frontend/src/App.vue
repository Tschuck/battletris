<template>
  <div class="overflow-hidden text-gray-300 bg-1" style="height: 100vh">
    <Loading v-if="loading" />
    <transition :name="transitionName" v-else>
      <router-view></router-view>
    </transition>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { ref, SetupContext } from '@vue/composition-api';
import router from './router';

import user from './lib/User';
import Loading from './components/general/Loading.vue';

@Component({
  components: {
    Loading,
  },
  setup(_, vm: SetupContext) {
    const loading = ref(true);
    const transitionName = ref('appear');
    const transitions = [
      { from: '/', to: '/mode', transition: 'slide-down' },
    ];

    router.beforeEach((to, from, next) => {
      const transition = transitions.find(({ from: a, to: b }) => a === from.path && b === to.path);
      transitionName.value = transition?.transition || 'appear';
      next();
    });

    (async () => {
      await user.init();
      loading.value = false;
    })();

    return {
      loading,
      transitionName,
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
  --bg-2: #242c31;
  --bg-3: #3e4649;
  --border: #4b4d4e;
}

.bg-1,
.bg-hover-1:hover {
  background-color: var(--bg-1);
}

.bg-2,
.bg-hover-2:hover {
  background-color: var(--bg-2);
}

.bg-3,
.bg-hover-3:hover {
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
    background-color: var(--bg-1);
  }
}

.button-outline {
  @apply px-4 py-2 font-bold border rounded;
  border: 1px solid var(--bg-3);

  &:hover {
    background-color: var(--bg-1);
  }
}

.bounce {
  -moz-animation: bounce 1s infinite;
  -webkit-animation: bounce 1s infinite;
  animation: bounce 1s infinite;
}
</style>
