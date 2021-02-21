<template>
  <ViewWrapper :title="$t('start-page.laboratory')" :showNav="!started">
    <div class="w-full px-8">
      <h2 class="mb-4 font-bold">{{ $t("laboratory.key-maps.title") }}</h2>

      <div class="flex">
        <VSelect
          class="w-full"
          :options="keyMapList"
          v-model="activeKeyMapId"
          :clearable="false"
          @change="keyMapChanged"
        >
          <template #selected-option="{ label }">
            {{ $t(`laboratory.key-maps.${label.toLowerCase()}`) }}
          </template>
          <template #option="{ label }">
            {{ $t(`laboratory.key-maps.${label.toLowerCase()}`) }}
          </template>
        </VSelect>

        <div class="flex-center">
          <font-awesome-icon
            class="ml-3 text-xl cursor-pointer"
            @click="addKeyMap"
            icon="plus"
          />
        </div>
      </div>

      <div class="mt-8">
        <div
          class="flex justify-between p-2 mt-1"
          v-for="keyId in keysList"
          :key="`${activeKeyMapId}-${keyId}`"
          style="border: 2px solid var(--bg-2)"
        >
          <div>{{ $t(`laboratory.keys.${keyId}`) }}</div>
          <div>{{ activeKeyMap[keyId] }}</div>
        </div>
      </div>
    </div>
    <div class="w-full">preview</div>
  </ViewWrapper>
</template>

<script lang="ts">
import { onUnmounted, ref } from '@vue/composition-api';
import { Component, Vue } from 'vue-property-decorator';
import { KeyMaps, KeyMapInterface } from '@battletris/shared';
import ViewWrapper from '../components/ViewWrapper.vue';
import user from '../lib/User';
import GameField from '../game/GameField.vue';

@Component({
  components: {
    GameField,
    ViewWrapper,
  },
  setup() {
    const started = ref(false);
    const userData = ref();
    const keyMapList = ref([...Object.keys(KeyMaps)]);
    const activeKeyMapId = ref(keyMapList.value[0]);
    const keysList = ref(Object.keys(KeyMaps.DefaultKeyMap));
    const activeKeyMap = ref<KeyMapInterface>();

    // start a single-player game
    const startGame = () => {
      userData.value = { speed: 1100, ...user };
      started.value = true;
    };

    // create seperate function for removing the event listener
    const gameCloseListener = () => {
      started.value = false;
    };

    // listener for game finished
    window.addEventListener('single-player-finished', gameCloseListener, false);
    onUnmounted(() => window.removeEventListener('single-player-finished', gameCloseListener));

    const keyMapChanged = () => {
      debugger;
      activeKeyMap.value = KeyMaps[activeKeyMapId.value] as KeyMapInterface;
    };
    keyMapChanged();

    return {
      activeKeyMap,
      activeKeyMapId,
      keyMapChanged,
      keyMapList,
      keysList,
      started,
      startGame,
      userData,
    };
  },
})
export default class Laboratory extends Vue {}
</script>
