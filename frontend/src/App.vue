<template>
  <div class="overflow-hidden text-gray-300 bg-1 vh-100">
    <router-view v-if="!loading"></router-view>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { ref } from '@vue/composition-api';

import user from './lib/User';

@Component({
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

.flex-center {
  @apply flex items-center justify-center;
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
  @apply flex flex-col justify-center w-full cursor-pointer py-16;
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

.v-select * {
  color: #fff
}

.vs__search::placeholder,
.vs__dropdown-toggle,
.vs__dropdown-menu {
  background: var(--bg-2);
  border: none;
  color: #fff;
  text-transform: lowercase;
  font-variant: small-caps;
}

.vs__clear,
.vs__open-indicator {
  fill: #fff;
}
</style>
