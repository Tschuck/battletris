<template>
  <ViewWrapper :title="$t('start-page.settings')">
    <Loading v-if="loading" />

    <div class="grid grid-cols-1 gap-4 md:grid-cols-2" v-else>
      <div class="p-8" style="max-width: 600px">
        <UserSetting :user="user" />
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
            class="p-3 mt-3 text-sm bg-2"
            v-for="(match, index) in matches"
            :key="index"
          >
            <p class="mb-2">
              <span class="font-bold">{{ $t('settings.history.time') }}: </span>
              <span>{{ match.started }} - {{ match.stopped }}</span>
            </p>
            <p class="mb-2" v-if="match.users[userId]">
              <span class="font-bold">{{ $t('settings.history.className') }}: </span>
              <span>{{ $t(`classes.${match.users[userId].className}.title`) }}</span>
            </p>
            <p class="mb-2" v-if="match.users[userId]">
              <span class="font-bold">{{ $t('settings.history.blocks') }}: </span>
              <span>{{ match.users[userId].blockCount }}</span>
            </p>
            <p class="mb-2" v-if="match.users[userId]">
              <span class="font-bold">{{ $t('settings.history.rows') }}: </span>
              <span>{{ match.users[userId].rowCount }}</span>
            </p>
            <p class="mb-2">
              <span class="font-bold">{{ $t('settings.history.status') }}: </span>
              <span>{{ match.winner === userId ? $t('settings.history.won') : $t('settings.history.lost') }}</span>
            </p>
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
import { classes } from '@battletris/shared/functions/classes';
import ViewWrapper from '../components/ViewWrapper.vue';

import { getRequest } from '../lib/request';
import AbilityLogo from '../icons/AbilityLogo.vue';
import Loading from '../components/Loading.vue';
import UserSetting from '../components/UserSetting.vue';
import user from '../lib/User';

import WarriorIcon from '../icons/warrior.vue';
import SorcererIcon from '../icons/sorcerer.vue';
import UnknownIcon from '../icons/unknown.vue';

@Component({
  components: {
    AbilityLogo,
    Loading,
    SorcererIcon,
    UnknownIcon,
    UserSetting,
    ViewWrapper,
    WarriorIcon,
  },
  setup() {
    const name = ref<string>(user.name);
    const className = ref(user.className);
    const userId = ref(user.id);
    console.log(classes);
    const classList = Object.keys(classes);
    const activeClassIndex = ref(classList.findIndex((key) => className.value === key));
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
        activeClassIndex.value = classList.length - 1;
      } else if (activeClassIndex.value >= classList.length) {
        activeClassIndex.value = 0;
      }

      className.value = classList[activeClassIndex.value];
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
      activeClassIndex,
      classList,
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
      userId,
      workingOnBattletrisId,
    };
  },
})
export default class Settings extends Vue {}
</script>
