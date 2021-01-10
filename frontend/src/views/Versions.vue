<template>
  <ViewWrapper :title="$t('start-page.versions')">
    <div style="max-width: 1200px">
      <div class="mb-8" v-for="version in versionList" :key="version">
        <h2 class="font-bold">{{ version }} - {{ versionObj[version].title }}</h2>
        <div class="p-4 mt-4 space-y-4 bg-2">
          <div
            v-for="changeKey in getChangesOrderForVersion(version)"
            :key="`${version}-${changeKey}`"
          >
            <p class="mb-1 font-bold">
              {{ $t(`versions.${changeKey}`) }}
            </p>

            <ul>
              <li
                v-for="(change, changeIndex) in versionObj[version][changeKey]"
                :key="`${version}-${changeKey}-${changeIndex}`"
              >
                - <span v-html="change" />
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </ViewWrapper>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { ref } from '@vue/composition-api';
import { versions, latestVersion, VersionInterface } from '../lib/versions';
import ViewWrapper from '../components/ViewWrapper.vue';

@Component({
  components: {
    ViewWrapper,
  },
  setup() {
    const versionList = ref(Object.keys(versions).reverse());
    const versionObj = ref<Record<string, VersionInterface>>(versions);
    const changesOrder: string[] = ['bugs', 'features', 'classes'];

    const getChangesOrderForVersion = (version: string): string[] => changesOrder
      .filter((key: string) => (versionObj.value as any)[version][key]
        && (versionObj.value as any)[version][key].length !== 0);

    // update latest battletris version
    window.localStorage.setItem('battletris-version', latestVersion);

    return {
      versionList,
      versionObj,
      getChangesOrderForVersion,
    };
  },
})
export default class Settings extends Vue {}
</script>
