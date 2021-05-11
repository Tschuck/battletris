<template>
  <div class="fixed bottom-0 left-0 right-0 flex justify-center mb-6">
    <router-link :to="`/tutorial?back=${$route.path}`" class="mx-2 tooltip-box">
      <TargetDummyIcon width="30px" />
      <Tooltip value="start-page.tutorial" style="width: 100px" />
    </router-link>
    <router-link
      :to="`/laboratory?back=${$route.path}`"
      class="mx-2 tooltip-box"
    >
      <FlaskIcon width="30px" />
      <Tooltip value="start-page.laboratory" style="width: 150px" />
    </router-link>
    <router-link
      :to="`/multi-player?back=${$route.path}`"
      class="mx-2 tooltip-box"
    >
      <CrossedSwordsIcon width="30px" />
      <Tooltip value="start-page.multi-player" style="width: 150px" />
    </router-link>
    <router-link :to="`/settings?back=${$route.path}`" class="mx-2 tooltip-box">
      <ScrollBookIcon width="30px" />
      <Tooltip value="start-page.settings" style="width: 200px" />
    </router-link>
    <router-link :to="`/versions?back=${$route.path}`" class="mx-2 tooltip-box">
      <BlacksmithIcon width="30px" :class="{ 'bounce': hasNewVersions }" />
      <Tooltip value="start-page.versions" style="width: 200px" />
    </router-link>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { ref } from '@vue/composition-api';
import { latestVersion } from '../lib/versions';
import CrossedSwordsIcon from '../icons/crossed-swords.vue';
import BlacksmithIcon from '../icons/blacksmith.vue';
import FlaskIcon from '../icons/flask.vue';
import ScrollBookIcon from '../icons/scroll-book.vue';
import TargetDummyIcon from '../icons/target-dummy.vue';
import Tooltip from './Tooltip.vue';

@Component({
  components: {
    BlacksmithIcon,
    CrossedSwordsIcon,
    FlaskIcon,
    ScrollBookIcon,
    TargetDummyIcon,
    Tooltip,
  },
  props: {
    value: { type: String },
  },
  setup() {
    const hasNewVersions = ref(false);

    // check if a new version is available, animate the versions icon
    const lastSeenVersion = window.localStorage.getItem('battletris-version');
    if (!lastSeenVersion || lastSeenVersion !== latestVersion) {
      hasNewVersions.value = true;
    }

    return {
      hasNewVersions,
    };
  },
})
export default class QuickLinks extends Vue {}
</script>
