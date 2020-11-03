<template>
  <div class="home">
    <Loading v-if="loading" />
    <div v-else>
      <ClassGallery
        v-model="className"
        @input="setLocalStorage('battletris-class', className)"
      />

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

@Component({
  components: {
    ClassGallery,
    Loading,
  },
  setup() {
    const loading = ref(true);
    const creating = ref(false);
    const games = ref<string[] | null>(null);
    const selectedGame = ref('');
    const name = ref(window.localStorage.getItem('battletris-name'));
    const className = ref(
      window.localStorage.getItem('battletris-class') || 'unknown',
    );

    (async () => {
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
    })();

    // save name / class in localStorage
    const setLocalStorage = (key: string, value: string) => window.localStorage.setItem(key, value);

    return {
      className,
      creating,
      games,
      loading,
      name,
      selectedGame,
      setLocalStorage,
    };
  },
})
export default class Home extends Vue {}
</script>
