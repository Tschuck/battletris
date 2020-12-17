<template>
  <ViewWrapper :loading="loading">
    <div class="grid grid-cols-3 gap-6 p-4">
      <div>
        <div class="mb-4 card">
          <h2 class="header">{{ $t("dashboard.tschuck.title") }}</h2>
          <div class="content">
            <p v-html="$t('dashboard.tschuck.desc')" />

            <div class="p-5 text-center">
              <a
                href="https://github.com/tschuck/battletris"
                target="_blank"
                :title="$t('dashboard.github')"
              >
                <font-awesome-icon
                  class="mr-4 text-3xl"
                  :icon="['fab', 'github']"
                />
              </a>
              <a
                href="https://www.buymeacoffee.com/eo3m4BAyO"
                target="_blank"
                :title="$t('dashboard.github')"
              >
                <font-awesome-icon
                  class="text-3xl"
                  icon="coffee"
                  :title="$t('dashboard.buy-me-a-coffee')"
                />
              </a>
            </div>
          </div>
        </div>

        <div class="card">
          <h2 class="header">{{ $t("dashboard.title") }}</h2>
          <p class="content">{{ $t("dashboard.desc") }}</p>

          <h3 class="px-3 mt-2 text-sm font-bold">
            {{ $t("dashboard.tavern.title") }}
          </h3>
          <p class="pt-0 content" v-html="$t('dashboard.tavern.desc')" />

          <h3 class="px-3 mt-2 text-sm font-bold">
            {{ $t("dashboard.battle-control.title") }}
          </h3>
          <p
            class="pt-0 content"
            v-html="$t('dashboard.battle-control.desc')"
          />

          <h3 class="px-3 mt-2 text-sm font-bold">
            {{ $t("dashboard.how-to-play.title") }}
          </h3>
          <p class="pt-0 content" v-html="$t('dashboard.how-to-play.desc')" />

          <h3 class="px-3 mt-2 text-sm font-bold">
            {{ $t("dashboard.abilities.title") }}
          </h3>
          <p class="pt-0 content" v-html="$t('dashboard.abilities.desc')" />

          <h3 class="px-3 mt-2 text-sm font-bold">
            {{ $t("dashboard.targets.title") }}
          </h3>
          <p class="pt-0 content" v-html="$t('dashboard.targets.desc')" />
        </div>
      </div>

      <div class="col-span-2">
        <div class="mb-5 card">
          <h2 class="header">{{ $t("user-id-handling.title") }}</h2>

          <div class="content">
            <p v-html="$t('user-id-handling.desc')" />
          </div>

          <div class="grid grid-cols-2 mt-5 place-items-center">
            <button
              class="button"
              @click="user.export()"
              :disabled="workingOnBattletrisId"
            >
              {{ $t("user-id-handling.export") }}
            </button>
            <button
              class="button"
              @click="uploadIdRef.click()"
              :disabled="workingOnBattletrisId"
            >
              {{ $t("user-id-handling.import") }}
            </button>
          </div>
          <p class="text-center text-red-500" v-if="importError">
            {{ $t("user-id-handling.import-invalid") }}
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
        </div>
        <div class="mb-5 card">
          <h2 class="header">{{ $t("room.join") }}</h2>
          <div class="flex flex-row flex-wrap content">
            <router-link
              class="flex-shrink-0 w-40 p-3 mb-2 mr-3 border rounded min-w-xs bg-hover-3"
              v-for="room in rooms"
              :key="room.id"
              :value="room.id"
              :to="`/${room.id}`"
            >
              <h3 class="text-xs font-bold">{{ room.name }}</h3>
              <i class="text-xs"
                >{{ room.connectionCount }} {{ $t("room.users-joined") }}</i
              >
              <i class="text-xs" v-if="room.isMatchRunning">{{
                $t("game.running")
              }}</i>
            </router-link>
          </div>
        </div>
        <div class="card">
          <h2 class="header">{{ $t("history.title") }}</h2>
          <div class="flex flex-row flex-wrap content">
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
    </div>
  </ViewWrapper>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { ref } from '@vue/composition-api';

import { disconnectLastConnection as disconnectRoom } from '../lib/RoomConnection';
import { disconnectLastConnection as disconnectGame } from '../lib/GameConnection';
import Loading from '../components/general/Loading.vue';
import ViewWrapper from '../components/ViewWrapper.vue';
import user from '../lib/User';
import { getRequest } from '../lib/request';

@Component({
  components: {
    Loading,
    ViewWrapper,
  },
  setup() {
    const loading = ref(true);
    const creating = ref(false);
    const rooms = ref<any[] | null>(null);

    // user params
    const name = ref(user.name);
    const className = ref(user.className || 'unknown');
    const matches = ref(user.matches || []);

    const init = async () => {
      loading.value = true;
      // disconnect last connection
      disconnectRoom();
      disconnectGame();
      // get room overview
      rooms.value = await getRequest('rooms');
      matches.value = await getRequest('user/matches');
      loading.value = false;
    };
    init();

    // save name / class in localStorage
    const setLocalStorage = (key: string, value: string) => window.localStorage.setItem(key, value);

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

    return {
      className,
      creating,
      importError,
      importUser,
      loading,
      matches,
      name,
      rooms,
      setLocalStorage,
      uploadIdRef,
      user,
      workingOnBattletrisId,
    };
  },
})
export default class Home extends Vue {}
</script>
