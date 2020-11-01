<template>
  <div class="home">
    <Loading v-if="loading" />
    <div v-else>
      {{ game }}
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { ref } from '@vue/composition-api';
import axios from 'axios';

import Loading from '../components/Loading.vue';
import config from '../config';

@Component({
  components: {
    Loading,
  },
  props: {
    gameName: { type: String },
  },
  setup(props) {
    const loading = ref(true);
    const creating = ref(false);
    const game = ref<any | null>(null);

    (async () => {
      const { data: { game: gameData } } = await axios.get(
        `${config.serverUrl}/game/${props.gameName}`,
      );
      game.value = gameData;
      loading.value = false;
    })();

    const connection = new WebSocket('ws://localhost:3000/ws');
    connection.onmessage = (event) => {
      console.log(event.data);
    };

    document.addEventListener('keypress', (e) => {
      connection.send(JSON.stringify({
        name: '5a2d1de9-2b7a-4f79-9c2b-ddcc1bd205a5',
        type: 'keypress',
        payload: e.code,
      }));
    });

    return {
      creating,
      game,
      loading,
    };
  },
})
export default class Home extends Vue {}
</script>
