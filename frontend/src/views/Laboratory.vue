<template>
  <ViewWrapper :title="$t('start-page.laboratory')" :showNav="!started">
    <div class="w-full p-8">
      <div class="mb-8">
      </div>

      <div>
        <h2 class="mb-4 font-bold">{{ $t("laboratory.key-maps.title") }}</h2>

        <div class="flex">
          <KeyMapSelect v-model="activeKeyMapId" @change="keyMapChanged" />

          <div class="flex-center">
            <font-awesome-icon
              class="ml-3 text-xl cursor-pointer"
              @click="addKeyMap"
              icon="plus"
            />
            <font-awesome-icon
              class="ml-3 text-xl cursor-pointer"
              @click="removeKeyMap"
              icon="trash"
              v-if="activeKeyMapId !== 'default' && activeKeyMapId !== 'wasd'"
            />
          </div>
        </div>

        <input
          class="flex-grow w-full px-3 py-2 mt-4 mr-3 leading-tight border rounded shadow appearance-none bg-2 focus:outline-none focus:shadow-outline"
          v-model="activeKeyMap.name"
          :placeholder="$t('laboratory.key-maps.name')"
          v-if="activeKeyMapId !== 'default' && activeKeyMapId !== 'wasd'"
        />

        <div class="mt-8">
          <div
            class="flex items-center justify-between mt-1"
            v-for="controlId in controlsList"
            :key="`${activeKeyMapId}-${controlId}`"
          >
            <div>{{ $t(`laboratory.state-changes.${controlId}`) }}</div>
            <div class="flex">
              <span
                class="relative flex items-center justify-center block px-3 py-1 mr-2 bg-white border rounded cursor-pointer bg-2 hover:bg-white hover:text-gray-800"
                @click="registerKey(controlId)"
              >
                <font-awesome-icon icon="plus" v-if="registeringKey !== controlId" />
                <span v-else>...</span>
              </span>
              <span
                class="relative block px-3 py-1 mr-2 border rounded bg-2"
                v-for="(keyId, keyIndex) in activeKeyMap.keys[UserStateChange[controlId]]"
                :key="keyId"
                @mouseenter="() => hoveredKey = keyId"
                @mouseleave="() => hoveredKey = null"
              >
                {{ $t(`laboratory.keys.${keyId}`) }}
                <div
                  class="absolute top-0 bottom-0 left-0 right-0 flex items-center justify-center bg-gray-300 cursor-pointer bg-opacity-40"
                  v-if="hoveredKey === keyId"
                  @click="unregisterKey(controlId, keyIndex)"
                >
                  <font-awesome-icon
                    class="text-2xl text-gray-800"
                    icon="times-circle"
                  />
                </div>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-8 text-xs text-center text-gray">
        {{ $t("laboratory.save-hint") }}
      </div>
    </div>
    <div class="w-full">preview</div>
  </ViewWrapper>
</template>

<script lang="ts">
import { KeyMapInterface, KeyMaps, UserStateChange } from '@battletris/shared';
import { onUnmounted, ref } from '@vue/composition-api';
import { Component, Vue } from 'vue-property-decorator';
import KeyMapSelect from '../components/KeyMapSelect.vue';
import ViewWrapper from '../components/ViewWrapper.vue';
import GameField from '../game/GameField.vue';
import user from '../lib/User';

@Component({
  components: {
    GameField,
    ViewWrapper,
    KeyMapSelect,
  },
  setup(props, { root }) {
    const hoveredKey = ref<string|undefined>();
    const keyMaps = ref<KeyMapInterface[]>([
      ...user.keyMaps,
      ...KeyMaps.map((KeyMapClass) => new KeyMapClass()),
    ]);
    const activeKeyMapId = ref(user.activeKeyMap || 'default');
    const controlsList = ref(Object
      .keys(UserStateChange)
      .filter((stateChange) => Number.isNaN(parseInt(stateChange, 10))));
    const activeKeyMap = ref<KeyMapInterface>();

    /** ************************ key map ********************************* */
    const keyMapChanged = (active: string | KeyMapInterface = activeKeyMapId.value) => {
      activeKeyMapId.value = typeof active === 'string' ? active : active.id;
      const selected = keyMaps.value.find(({ id }) => activeKeyMapId.value === id);
      if (selected) {
        activeKeyMap.value = selected;
      }
    };
    keyMapChanged();
    if (!activeKeyMap.value) {
      keyMapChanged('default');
    }
    const addKeyMap = () => {
      const tempId = (keyMaps.value.length - 1).toString(); // generate temporary id
      const newKeyMap: KeyMapInterface = {
        id: tempId,
        name: `${root.$i18n.t('laboratory.key-maps.new')} ${tempId}`,
        keys: JSON.parse(JSON.stringify(activeKeyMap.value.keys)),
      };
      keyMaps.value.push(newKeyMap);
      keyMapChanged(newKeyMap.id);
    };
    const removeKeyMap = async () => {
      const activeId = activeKeyMapId.value;
      keyMaps.value.splice(keyMaps.value.findIndex(({ id }) => activeId === id), 1);
      await user.deleteKeyMap(activeId);
      keyMapChanged('default');
    };

    /** ************************ key registration ********************************* */
    const registeringKey = ref<string|undefined>();
    let keyListener;
    const unregisterKey = (controlId: string, keyIndex: number) => {
      if (activeKeyMapId.value === 'default' || activeKeyMapId.value === 'wasd') {
        addKeyMap();
      }

      activeKeyMap.value.keys[UserStateChange[controlId]].splice(keyIndex, 1);
    };
    const registerKey = (control: string) => {
      if (activeKeyMapId.value === 'default' || activeKeyMapId.value === 'wasd') {
        addKeyMap();
      }

      if (keyListener) {
        document.removeEventListener('keyup', keyListener);
      }
      registeringKey.value = control;

      keyListener = (event: KeyboardEvent) => {
        // search for other references and remove this key
        controlsList.value.forEach((key: string) => {
          const controlIdIndex = activeKeyMap.value.keys[UserStateChange[key]].indexOf(event.keyCode);
          if (controlIdIndex !== -1) {
            activeKeyMap.value.keys[UserStateChange[key]].splice(controlIdIndex, 1);
          }
        });
        // add the new key
        activeKeyMap.value.keys[UserStateChange[control]].unshift(event.keyCode);
        registeringKey.value = control;
        registeringKey.value = '';
        document.removeEventListener('keyup', keyListener);
        keyListener = null;
        event.preventDefault();
        event.stopPropagation();
        return false;
      };

      document.addEventListener('keyup', keyListener);
    };

    /** ******************************** game preview logic ************************************* */
    const started = ref(false);
    const userData = ref();
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
    onUnmounted(async () => {
      window.removeEventListener('single-player-finished', gameCloseListener);
      await user.saveKeyMaps(
        activeKeyMapId.value,
        keyMaps.value.filter((keyMap) => keyMap.id !== 'default' && keyMap.id !== 'wasd'),
      );
    });

    return {
      activeKeyMap,
      activeKeyMapId,
      addKeyMap,
      controlsList,
      hoveredKey,
      keyMapChanged,
      keyMaps,
      registeringKey,
      registerKey,
      removeKeyMap,
      started,
      startGame,
      unregisterKey,
      userData,
      UserStateChange,
    };
  },
})
export default class Laboratory extends Vue {}
</script>
