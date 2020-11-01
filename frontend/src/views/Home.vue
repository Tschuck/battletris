<template>
  <div class="home">
    <Loading v-if="loading" />
    <div v-else>
      <div>
        <input v-model="gameName" placeholder="game name" />
        <button :disabled="!gameName" @click="createNewGame()">create new game</button>
      </div>
      <div v-for="game in games" :key="game">
        <router-link :to="`/${game}`">
          {{ game }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { ref } from '@vue/composition-api';
import axios from 'axios';

import Loading from '@/components/Loading.vue';
import config from '../config';

@Component({
  components: {
    Loading,
  },
  setup(props, { root }) {
    const loading = ref(true);
    const creating = ref(false);
    const games = ref<string[] | null>(null);
    const gameName = ref<string>('');

    const createNewGame = async () => {
      creating.value = true;
      try {
        await axios.post(`${config.serverUrl}/game/${gameName.value}`);
        root.$router.push(`/${gameName.value}`);
      } catch (ex) {
        console.error(ex);
        // todo: show toast
      }
    };

    (async () => {
      const { data: { games: loadedGames } } = await axios.get(`${config.serverUrl}/games`);
      games.value = Object.keys(loadedGames).map((key) => loadedGames[key].name);
      loading.value = false;
    })();

    return {
      createNewGame,
      creating,
      gameName,
      games,
      loading,
    };
  },
})
export default class Home extends Vue {}
</script>
