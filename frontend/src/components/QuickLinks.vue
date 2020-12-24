<template>
  <div class="fixed bottom-0 left-0 right-0 flex justify-center mb-6">
    <router-link :to="`/tutorial?back=${$route.path}`" class="mx-2 tooltip-box">
      <TargetDummyIcon width="30px" />
      <Tooltip :value="$t('start-page.tutorial')" />
    </router-link>
    <router-link :to="`/single-player?back=${$route.path}`" class="mx-2 tooltip-box">
      <KimonoIcon width="30px" />
      <Tooltip :value="$t('start-page.single-player')" />
    </router-link>
    <router-link :to="`/multi-player?back=${$route.path}`" class="mx-2 tooltip-box">
      <CrossedSowrdsIcon width="30px" />
      <Tooltip :value="$t('start-page.multi-player')" />
    </router-link>
    <router-link :to="`/settings?back=${$route.path}`" class="mx-2 tooltip-box">
      <ScrollBookIcon width="30px" />
      <Tooltip :value="$t('start-page.settings')" />
    </router-link>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import CrossedSowrdsIcon from '../icons/crossed-swords.vue';
import KimonoIcon from '../icons/kimono.vue';
import ScrollBookIcon from '../icons/scroll-book.vue';
import TargetDummyIcon from '../icons/target-dummy.vue';
import Tooltip from './Tooltip.vue';

@Component({
  components: {
    CrossedSowrdsIcon,
    KimonoIcon,
    ScrollBookIcon,
    TargetDummyIcon,
    Tooltip,
  },
  props: {
    value: { type: String },
  },
})
export default class QuickLinks extends Vue {}
</script>
