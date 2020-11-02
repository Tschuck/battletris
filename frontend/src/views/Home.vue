<template>
  <div class="home">
    <Loading v-if="loading" />
    <div v-else>
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

import Loading from '../components/Loading.vue';
import config from '../config';
import { disconnectLastConnection } from '../lib/GameConnection';

@Component({
  components: {
    Loading,
  },
  setup() {
    const loading = ref(true);
    const creating = ref(false);
    const games = ref<string[] | null>(null);

    (async () => {
      // disconnect last connection
      disconnectLastConnection();
      // get game overview
      const { data: { games: loadedGames } } = await axios.get(`${config.serverUrl}/games`);
      games.value = Object.keys(loadedGames).map((key) => loadedGames[key].name);
      loading.value = false;
    })();

    return {
      creating,
      games,
      loading,
    };
  },
})
export default class Home extends Vue {}
</script>
