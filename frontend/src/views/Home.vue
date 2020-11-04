<template>
  <div class="home">
    <Loading v-if="loading" />
    <div v-else>
      <ClassGallery
        v-model="className"
        @input="setLocalStorage('battletris-class', className)"
      />

      <div>Whats battletris?</div>

      <div>
        <div>
          no match history available? Play a match or login with a exported
          battletris id.

          <div class="custom-file">
            <input
              accept=".json"
              class="custom-file-input"
              id="uploadIdRef"
              ref="uploadIdRef"
              type="file"
              @change="importConnectionId()">
              <p class="text-danger" v-if="importError">
                invalid import
              </p>
            <label class="custom-file-label" for="uploadIdRef">
              import battletris id
            </label>
          </div>

          want to login again on an other machine?
          <button :disabled="workingOnBattletrisId" @click="user.exportConnectionId()">
            export battletris id
          </button>
        </div>

        <div>match history</div>
      </div>

      <div>
        <input
          v-model="name"
          placeholder="username"
          @input="setLocalStorage('battletris-name', name)"
        />
        <select v-model="selectedGame">
          <option v-for="gameName in games" :key="gameName" :value="gameName">
            {{ gameName }}
          </option>
        </select>
        <router-link class="button" :to="`/${selectedGame}`">join</router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { ref } from '@vue/composition-api';
import axios from 'axios';

import { disconnectLastConnection } from '../lib/GameConnection';
import ClassGallery from '../components/ClassGallery.vue';
import config from '../config';
import Loading from '../components/Loading.vue';
import user from '../lib/User';

@Component({
  components: {
    ClassGallery,
    Loading,
  },
  setup() {
    const loading = ref(true);
    const creating = ref(false);
    const games = ref<string[] | null>(null);

    // user params
    const selectedGame = ref('');
    const name = ref(user.name);
    const className = ref(user.className || 'unknown');

    const init = async () => {
      loading.value = true;
      // disconnect last connection
      disconnectLastConnection();
      // get game overview
      const {
        data: { games: loadedGames },
      } = await axios.get(`${config.serverUrl}/games`);
      games.value = Object.keys(loadedGames).map(
        (key) => loadedGames[key].name,
      );
      [selectedGame.value] = games.value;
      loading.value = false;
    };
    init();

    // save name / class in localStorage
    const setLocalStorage = (key: string, value: string) => window.localStorage.setItem(key, value);

    // session import / export
    const workingOnBattletrisId = ref(false);
    const importError = ref(false);
    const uploadIdRef = ref<{ files: Blob[] }|null>(null);
    const importConnectionId = async () => {
      loading.value = true;
      await user.importConnectionId(uploadIdRef.value as { files: Blob[] });
      // use latest user data
      name.value = user.name;
      className.value = user.className;
      loading.value = false;
    };

    return {
      className,
      creating,
      games,
      importConnectionId,
      importError,
      loading,
      name,
      selectedGame,
      setLocalStorage,
      uploadIdRef,
      user,
      workingOnBattletrisId,
    };
  },
})
export default class Home extends Vue {}
</script>
