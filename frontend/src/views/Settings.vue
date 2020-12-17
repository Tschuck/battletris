<template>
  <ViewWrapper>
    <Loading class="mt-20" v-if="loading" />

    <div class="grid grid-cols-1 gap-4 mt-20 md:grid-cols-2" v-else>
      <div class="p-8" style="max-width: 600px">
        <p class="mb-3 font-bold">{{ $t('settings.name') }}</p>
        <input
          v-model="name"
          id="battletrisname"
          placeholder="username"
          class="w-full px-3 py-2 leading-tight border rounded outline-none bg-2"
          @change="updateUser"
        />

        <div class="mt-8">
          <p class="mb-3 font-bold">{{ $t('settings.class') }}</p>

          <div class="flex flex-row items-center justify-center">
            <font-awesome-icon class="text-4xl cursor-pointer" icon="chevron-left" @click="selectClass(-1)" />
            <component
              :is="classes[activeClassIndex].icon"
              height="80px"
              width="80px"
            />
            <font-awesome-icon class="text-4xl cursor-pointer" icon="chevron-right" @click="selectClass(1)" />
          </div>

          <p class="my-3 font-bold text-center">{{ $t(`classes.${className}.title`) }}</p>
          <p class="p-3 italic bg-2">{{ $t(`classes.${className}.desc`) }}</p>

          <div
            v-for="(_, index) in abilityIterator"
            :key="`value-${className}-${index}`"
            class="flex items-center mt-4"
          >
            <div>
              <AbilityLogo
                :abilityIndex="index"
                :className="className"
                width="32px"
                height="32px"
              />
            </div>
            <div class="ml-3">
              <h2 class="text-xs font-bold">
                {{ $t(`classes.${className}.ability${index}.title`) }}
              </h2>
              <p
                class="text-xs text-justify text-gray-400"
                v-html="$t(`classes.${className}.ability${index}.desc`)"
              ></p>
            </div>
          </div>
        </div>
      </div>

      <div class="p-8" style="max-width: 600px">
        <h2 class="mb-3 font-bold">{{ $t('settings.user-id-handling.title') }}</h2>

        <p class="p-4 text-xs bg-2" v-html="$t('settings.user-id-handling.desc')" />

        <div class="grid grid-cols-2 mt-5 place-items-center">
          <button
            class="button"
            @click="user.export()"
            :disabled="workingOnBattletrisId"
          >
            {{ $t("settings.user-id-handling.export") }}
          </button>
          <button
            class="button"
            @click="uploadIdRef.click()"
            :disabled="workingOnBattletrisId"
          >
            {{ $t("settings.user-id-handling.import") }}
          </button>
        </div>
        <p class="text-center text-red-500" v-if="importError">
          {{ $t("settings.user-id-handling.import-invalid") }}
        </p>
        <div class="mb-8"></div>
        <div class="hidden">
          <input
            accept=".json"
            class=""
            id="uploadIdRef"
            ref="uploadIdRef"
            type="file"
            @change="importUser()"
          />
        </div>

        <h2 class="mb-3 font-bold">{{ $t('settings.history.title') }}</h2>

        <div class="p-4 text-xs bg-2" v-if="matches.length === 0">
          {{ $t('settings.history.no-matches') }}
        </div>
        <div v-else>
          <div
            class="p-3 mt-3 overflow-hidden border"
            v-for="(match, index) in matches"
            :key="index"
          >
            {{ match }}
          </div>
        </div>
      </div>
    </div>
  </ViewWrapper>
</template>

<script lang="ts">
import {
  Component, Vue,
} from 'vue-property-decorator';
import { ref } from '@vue/composition-api';
import ViewWrapper from '../components/ViewWrapper.vue';

import { getRequest } from '../lib/request';
import AbilityLogo from '../icons/AbilityLogo.vue';
import Loading from '../components/Loading.vue';
import SorcererIcon from '../icons/sorcerer.vue';
import UnknownIcon from '../icons/unknown.vue';
import user from '../lib/User';
import WarriorIcon from '../icons/warrior.vue';

@Component({
  components: {
    AbilityLogo,
    Loading,
    SorcererIcon,
    UnknownIcon,
    ViewWrapper,
    WarriorIcon,
  },
  setup() {
    const name = ref<string>(user.name);
    const className = ref(user.className);
    const classes = [
      { name: 'unknown', icon: UnknownIcon },
      { name: 'warrior', icon: WarriorIcon },
      { name: 'sorcerer', icon: SorcererIcon },
    ];
    const abilityIterator = ref([1, 2, 3, 4]);
    const activeClassIndex = ref(classes.findIndex(({ name: n }) => className.value === n));
    const matches = ref();
    const loading = ref(true);

    const init = async () => {
      loading.value = true;
      matches.value = await getRequest('user/matches');
      loading.value = false;
    };

    let debounce: ReturnType<typeof setTimeout>;
    const updateUser = () => {
      if (debounce) {
        window.clearTimeout(debounce);
      }

      if (name.value.length > 50) {
        name.value = name.value.slice(0, 50);
      }

      debounce = setTimeout(() => user.update(name.value, className.value), 500);
    };

    const selectClass = (increase: number) => {
      activeClassIndex.value += increase;

      if (activeClassIndex.value < 0) {
        activeClassIndex.value = classes.length - 1;
      } else if (activeClassIndex.value >= classes.length) {
        activeClassIndex.value = 0;
      }

      className.value = classes[activeClassIndex.value].name;
      updateUser();
    };

    // session import / export
    const workingOnBattletrisId = ref(false);
    const importError = ref(false);
    const uploadIdRef = ref<{ files: Blob[] } | null>(null);
    const importUser = async () => {
      loading.value = true;
      try {
        await user.import(uploadIdRef.value as { files: Blob[] });
        await init();
        importError.value = false;
      } catch (ex) {
        importError.value = true;
      }
      // use latest user data
      name.value = user.name;
      className.value = user.className;
      loading.value = false;
    };

    init();

    return {
      abilityIterator,
      activeClassIndex,
      classes,
      className,
      importError,
      importUser,
      loading,
      matches,
      name,
      selectClass,
      updateUser,
      uploadIdRef,
      user,
      workingOnBattletrisId,
    };
  },
})
export default class Settings extends Vue {}
</script>
