<template>
  <div class="overflow-hidden text-gray-300 bg-1 vh-100">
    <!-- <transition :name="transitionName" v-if="!loading"> -->
    <router-view v-if="!loading"></router-view>
    <!-- </transition> -->
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { ref } from '@vue/composition-api';
// import router from './router';

import user from './lib/User';

@Component({
  setup() {
    const loading = ref(true);
    // const transitionName = ref('appear');
    // const transitions = [{ from: '/', to: '/mode', transition: 'slide-down' }];

    // router.beforeEach((to, from, next) => {
    //   const transition = transitions.find(
    //     ({ from: a, to: b }) => a === from.path && b === to.path,
    //   );
    //   transitionName.value = transition?.transition || 'appear';
    //   next();
    // });

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
  --bg-2: #242c31;
  --bg-3: #e2e8f0;
  --border: var(--bg-1);
}

/** disble ios double tap */
* {
  touch-action: manipulation;
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

  &:hover {
    @apply text-gray-900;
  }
}

.header-bg {
  background-color: var(--bg-1);
  border: var(--border);
}

.button {
  @apply px-4 py-2 font-bold rounded;
  background-color: var(--bg-2);

  &:hover {
    background-color: var(--bg-3);
    color: var(--bg-1);
  }
}

.button-outline {
  @apply px-4 py-2 font-bold border rounded;
  border: 1px solid var(--border);

  &:hover {
    background-color: var(--bg-1);
  }
}

.vh-100 {
  height: 100vh;
}

.bounce {
  -moz-animation: bounce 1s infinite;
  -webkit-animation: bounce 1s infinite;
  animation: bounce 1s infinite;
}

.selection-card {
  @apply flex flex-col justify-center w-full p-10 cursor-pointer;
  background-color: var(--bg-2);
  transition: 0.2s background-color ease-out;
  height: 600px;

  @media (min-width: 768px) {
    @apply w-1/4;
  }

  &:hover {
    background-color: var(--bg-3);

    h1, h2, h3 {
      color: var(--bg-2);
    }

    .button-outline {
      color: var(--bg-1);

      &:hover {
        @apply text-gray-300;
      }
    }

    svg path {
      fill: var(--bg-1);
    }

    .tooltip {
      svg path {
        fill: var(--bg-3);
      }
    }
  }

  svg {
    max-width: 100%;
  }

  .button {
    background-color: var(--bg-1);
    @apply text-gray-300;
  }
}
</style>
