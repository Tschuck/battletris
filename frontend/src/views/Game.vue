<template>
  <div class="home">
    <Loading v-if="loading" />
    <div v-else>
      <h1>{{ game }}</h1>

      <div v-for="(message, index) in messages" :key="index">
        {{ message }}
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
    const messages = ref<any[]>([]);

    (async () => {
      const { data: { game: gameData } } = await axios.get(
        `${config.serverUrl}/game/${props.gameName}`,
      );
      game.value = gameData;
      loading.value = false;
    })();

    const connection = new WebSocket('ws://localhost:3000/ws');
    connection.onmessage = (event) => {
      messages.value.push(event.data);
    };

    document.addEventListener('keypress', (e) => {
      connection.send(JSON.stringify({
        name: props.gameName,
        type: 'keypress',
        payload: e.code,
      }));
    });

    return {
      creating,
      game,
      loading,
      messages,
    };
  },
})
export default class Home extends Vue {}
</script>
