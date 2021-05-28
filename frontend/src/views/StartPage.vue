<template>
  <div class="flex flex-col justify-center vh-100">
    <div class="flex justify-center mb-8">
      <div
        class="flex items-center justify-center block w-40 h-40 p-5 rounded rounded-full bg-2"
      >
        <BattletrisIcon width="100px" class="rounded bg-2" />
      </div>
    </div>
    <h1 class="text-5xl text-center">BATTLETRIS</h1>
    <div class="p-8 text-center">
      <a
        href="https://github.com/tschuck/battletris"
        target="_blank"
        class="tooltip-box"
      >
        <font-awesome-icon class="mr-4 text-3xl" :icon="['fab', 'github']" />
        <Tooltip :value="$t('start-page.github')" style="width: 200px" />
      </a>
      <a
        href="https://www.buymeacoffee.com/eo3m4BAyO"
        target="_blank"
        class="tooltip-box"
      >
        <font-awesome-icon class="text-3xl" icon="coffee" />
        <Tooltip :value="$t('start-page.buy-me-a-coffee')" style="width: 200px" />
      </a>
    </div>

    <div class="text-center">
      <router-link class="button" :to="`/multi-player/${rooms[0].id}`">
        {{ $t('start-page.play-now') }}
      </router-link>
    </div>

    <div class="mt-12 text-center cursor-pointer">
      <router-link to="/mode">
        <font-awesome-icon class="text-4xl bounce" icon="chevron-down" />
      </router-link>
    </div>

    <QuickLinks />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import { ref } from '@vue/composition-api';
import BattletrisIcon from '../icons/battletris.vue';
import Tooltip from '../components/Tooltip.vue';
import QuickLinks from '../components/QuickLinks.vue';
import { getRequest } from '../lib/request';

@Component({
  components: {
    BattletrisIcon,
    QuickLinks,
    Tooltip,
  },
  setup() {
    const loading = ref(true);
    const rooms = ref<any[] | null>(null);

    (async () => {
      rooms.value = await getRequest('rooms');
      loading.value = false;
    })();

    return {
      loading,
      rooms,
    };
  },
})
export default class Tutorial extends Vue {}
</script>
