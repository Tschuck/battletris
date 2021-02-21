<template>
  <ViewWrapper backRoute="/" class="text-center" :title="$t('start-page.mode-selection')">
    <div class="items-center px-8 md:flex md:justify-center md:flex-row">
      <router-link class="border-8 selection-card" to="/tutorial">
        <div>
          <TargetDummyIcon width="250px" />
          <h2 class="mt-4 font-bold">{{ $t('start-page.tutorial') }}</h2>
          <h3>{{ $t('start-page.tutorial-desc') }}</h3>
        </div>
      </router-link>
      <router-link class="border-8 selection-card" to="/laboratory">
        <div>
          <FlaskIcon width="250px" />
          <h2 class="mt-4 font-bold">{{ $t('start-page.laboratory') }}</h2>
          <h3>{{ $t('start-page.laboratory-desc') }}</h3>
        </div>
      </router-link>
      <router-link class="border-8 selection-card" to="/multi-player">
        <div>
          <CrossedSowrdsIcon width="250px" />
          <h2 class="mt-4 font-bold">{{ $t('start-page.multi-player') }}</h2>
          <h3>{{ $t('start-page.multi-player-desc') }}</h3>
        </div>
      </router-link>
      <router-link class="border-8 selection-card" to="/settings">
        <div>
          <ScrollBookIcon width="250px" />
          <h2 class="mt-4 font-bold">{{ $t('start-page.settings') }}</h2>
          <h3>{{ $t('start-page.settings-desc') }}</h3>
        </div>
      </router-link>
    </div>
  </ViewWrapper>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import BattletrisIcon from '../icons/battletris.vue';
import CrossedSowrdsIcon from '../icons/crossed-swords.vue';
import FlaskIcon from '../icons/flask.vue';
import ScrollBookIcon from '../icons/scroll-book.vue';
import TargetDummyIcon from '../icons/target-dummy.vue';
import ViewWrapper from '../components/ViewWrapper.vue';

@Component({
  components: {
    BattletrisIcon,
    CrossedSowrdsIcon,
    FlaskIcon,
    ScrollBookIcon,
    TargetDummyIcon,
    ViewWrapper,
  },
})
export default class Tutorial extends Vue {}
</script>
