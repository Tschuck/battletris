<template>
  <div class="text-center">
    <router-link class="absolute mt-6" to="/">
      <font-awesome-icon class="text-4xl bounce" icon="chevron-up" />
    </router-link>

    <div class="flex flex-row justify-center py-48" style="height: 100vh;">
      <router-link class="border-r selection" to="/tutorial">
        <div>
          <TargetDummyIcon width="250px" color="var(--bg-1)" />
          <p class="mt-4 font-bold">{{ $t('start-page.tutorial') }}</p>
          <p>{{ $t('start-page.tutorial-desc') }}</p>
        </div>
      </router-link>
      <router-link class="border-r selection" to="/single-player">
        <div>
          <KimonoIcon width="250px" color="var(--bg-1)" />
          <p class="mt-4 font-bold">{{ $t('start-page.single-player') }}</p>
          <p>{{ $t('start-page.single-player-desc') }}</p>
        </div>
      </router-link>
      <router-link class="selection" to="/multi-player">
        <div>
          <CrossedSowrdsIcon width="250px" color="var(--bg-1)" />
          <p class="mt-4 font-bold">{{ $t('start-page.multi-player') }}</p>
          <p>{{ $t('start-page.multi-player-desc') }}</p>
        </div>
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

<style lang="postcss" >
  @tailwind base;

  .selection {
    @apply flex flex-col justify-center w-1/3 p-10 cursor-pointer;
    background-color: var(--bg-2);
    transition: 0.2s background-color ease-out;

    &:hover {
      @apply bg-gray-400;

      * {
        color: var(--bg-2);
      }
    }
  }
</style>
