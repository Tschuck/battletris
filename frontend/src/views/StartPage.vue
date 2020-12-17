<template>
  <div class="flex flex-col justify-center" style="height: 100vh">
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
        :title="$t('dashboard.github')"
      >
        <font-awesome-icon class="mr-4 text-3xl" :icon="['fab', 'github']" />
      </a>
      <a
        href="https://www.buymeacoffee.com/eo3m4BAyO"
        target="_blank"
        :title="$t('dashboard.github')"
      >
        <font-awesome-icon
          class="text-3xl"
          icon="coffee"
          :title="$t('dashboard.buy-me-a-coffee')"
        />
      </a>
    </div>

    <div
      class="absolute bottom-0 left-0 right-0 flex justify-center mb-6"
    >
      <router-link to="/tutorial" class="mx-2">
        <TargetDummyIcon
          :title="$t('start-page.tutorial')"
          width="30px"
          color="#e2e8f0"
        />
      </router-link>
      <router-link to="/single-player" class="mx-2">
        <KimonoIcon
          :title="$t('start-page.single-player')"
          width="30px"
          color="#e2e8f0"
        />
      </router-link>
      <router-link to="/multi-player" class="mx-2">
        <CrossedSowrdsIcon
          :title="$t('start-page.multi-player')"
          width="30px"
          color="#e2e8f0"
        />
      </router-link>
    </div>

    <div class="mt-12 text-center cursor-pointer">
      <router-link to="/mode">
        <font-awesome-icon class="text-4xl bounce" icon="chevron-down" />
      </router-link>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Loading from '../components/general/Loading.vue';

import BattletrisIcon from '../icons/battletris.vue';
import KimonoIcon from '../icons/kimono.vue';
import CrossedSowrdsIcon from '../icons/crossed-swords.vue';
import TargetDummyIcon from '../icons/target-dummy.vue';

@Component({
  components: {
    Loading,
    BattletrisIcon,
    KimonoIcon,
    CrossedSowrdsIcon,
    TargetDummyIcon,
  },
})
export default class Tutorial extends Vue {}
</script>
