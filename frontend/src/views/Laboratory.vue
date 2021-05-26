<template>
  <ViewWrapper :title="$t('start-page.laboratory')">
    <div class="flex justify-center w-full h-full py-8 overflow-y-auto">
      <div>
        <div class="flex justify-between">
          <h2 class="mb-4 font-bold">{{ $t("laboratory.key-maps.title") }}</h2>
          <p class="text-xs text-center text-gray-400">
            {{
              disabled
                ? $t("laboratory.handling.disabled-hint")
                : $t("laboratory.save-hint")
            }}
          </p>
        </div>
        <div class="flex">
          <KeyMapSelect
            v-model="activeKeyMapId"
            :keyMaps="keyMaps"
            @change="keyMapChanged"
          />

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

        <div class="my-4">
          <div class="">
            <span
              >{{ $t("laboratory.handling.arr.title") }} ({{
                activeKeyMap.arr
              }}ms)</span
            >
            <VueSlider
              class="flex-grow"
              v-model="activeKeyMap.arr"
              drag-on-click
              :min="0"
              :max="300"
              :disabled="disabled"
            />
          </div>
          <span class="text-xs text-justify text-gray-400">{{
            $t("laboratory.handling.arr.desc")
          }}</span>
        </div>
        <div class="my-4">
          <div class="">
            <span
              >{{ $t("laboratory.handling.das.title") }} ({{
                activeKeyMap.das
              }}ms)</span
            >
            <VueSlider
              class="flex-grow"
              v-model="activeKeyMap.das"
              drag-on-click
              :min="0"
              :max="300"
              :disabled="disabled"
            />
          </div>
          <span class="text-xs text-justify text-gray-400">{{
            $t("laboratory.handling.das.desc")
          }}</span>
        </div>
        <div class="my-4">
          <div class="">
            <span
              >{{ $t("laboratory.handling.dcd.title") }} ({{
                activeKeyMap.dcd
              }}ms)</span
            >
            <VueSlider
              class="flex-grow"
              v-model="activeKeyMap.dcd"
              drag-on-click
              :min="0"
              :max="300"
              :disabled="disabled"
            />
          </div>
          <span class="text-xs text-justify text-gray-400">{{
            $t("laboratory.handling.dcd.desc")
          }}</span>
        </div>
        <div class="my-4">
          <div class="">
            <span
              >{{ $t("laboratory.handling.sdf.title") }} ({{
                activeKeyMap.sdf
              }}ms)</span
            >
            <VueSlider
              class="flex-grow"
              v-model="activeKeyMap.sdf"
              drag-on-click
              :min="0"
              :max="300"
              :disabled="disabled"
            />
          </div>
          <span class="text-xs text-justify text-gray-400">{{
            $t("laboratory.handling.sdf.desc")
          }}</span>
        </div>
        <div class="my-4">
          <div class="">
            <span
              >{{ $t("laboratory.handling.rts.title") }} ({{
                activeKeyMap.rts
              }}ms)</span
            >
            <VueSlider
              class="flex-grow"
              v-model="activeKeyMap.rts"
              drag-on-click
              :min="0"
              :max="300"
              :disabled="disabled"
            />
          </div>
          <span class="text-xs text-justify text-gray-400">{{
            $t("laboratory.handling.rts.desc")
          }}</span>
        </div>

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
                v-if="!disabled"
              >
                <font-awesome-icon
                  icon="plus"
                  v-if="registeringKey !== controlId"
                />
                <span v-else>...</span>
              </span>
              <span
                class="relative block px-3 py-1 mr-2 border rounded bg-2"
                v-for="(keyId, keyIndex) in activeKeyMap.keys[
                  UserStateChange[controlId]
                ]"
                :key="keyId"
                @mouseenter="() => (hoveredKey = keyId)"
                @mouseleave="() => (hoveredKey = null)"
              >
                {{ $t(`laboratory.keys.${keyId}`) }}
                <div
                  class="absolute top-0 bottom-0 left-0 right-0 flex items-center justify-center bg-gray-300 cursor-pointer bg-opacity-40"
                  v-if="!disabled && hoveredKey === keyId"
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
    </div>
    <SinglePlayer :onStart="beforeGameStart"/>
  </ViewWrapper>
</template>

<script lang="ts">
import {
  KeyMapInterface, KeyMaps, UserStateChange,
} from '@battletris/shared';
import { computed, onUnmounted, ref } from '@vue/composition-api';
import { Component, Vue } from 'vue-property-decorator';
import VueSlider from 'vue-slider-component';
import SinglePlayer from '../components/SinglePlayer.vue';
import KeyMapSelect from '../components/KeyMapSelect.vue';
import user from '../lib/User';
import ViewWrapper from '../components/ViewWrapper.vue';

@Component({
  components: {
    SinglePlayer,
    KeyMapSelect,
    ViewWrapper,
    VueSlider,
  },
  setup(props, { root }) {
    const hoveredKey = ref<string | undefined>();
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
        ...activeKeyMap.value,
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
    const registeringKey = ref<string | undefined>();
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

    const disabled = computed(() => activeKeyMapId.value === 'default' || activeKeyMapId.value === 'wasd');

    /** ******************************** game preview logic ************************************* */
    const beforeGameStart = async () => {
      await user.saveKeyMaps(
        activeKeyMapId.value,
        keyMaps.value.filter((keyMap) => keyMap.id !== 'default' && keyMap.id !== 'wasd'),
      );
    };
    // listener for game finished
    onUnmounted(async () => {
      beforeGameStart();
    });

    return {
      activeKeyMap,
      activeKeyMapId,
      addKeyMap,
      beforeGameStart,
      controlsList,
      disabled,
      hoveredKey,
      keyMapChanged,
      keyMaps,
      registeringKey,
      registerKey,
      removeKeyMap,
      unregisterKey,
      UserStateChange,
    };
  },
})
export default class Laboratory extends Vue { }
</script>
