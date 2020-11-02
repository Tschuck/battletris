<template>
  <div class="home">
    <Loading v-if="loading" />
    <div v-else>
      <h1>{{ game }}</h1>

      <textarea v-model="newMessage"></textarea>
      <button @click="sendMessage" :disabled="sending">send message</button>

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

import GameConnection from '../lib/GameConnection';
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

    let conn: GameConnection;
    (async () => {
      // connect to the websocket
      conn = await GameConnection.connect(
        props.gameName as string,
        (data) => {
          messages.value.push(data);
        },
      );

      // get general game data
      const { data: { game: gameData } } = await axios.get(
        `${config.serverUrl}/game/${props.gameName}`,
      );
      game.value = gameData;
      loading.value = false;

      // listen for keypress events
      // document.addEventListener('keypress', (e) => conn.send('keypress', e.code));
    })();

    const newMessage = ref('');
    const sending = ref(false);
    const sendMessage = async (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
      sending.value = true;
      await conn.send('chat', newMessage.value);
      newMessage.value = '';
      sending.value = false;
    };

    return {
      creating,
      game,
      loading,
      messages,
      // for sending chat messages
      newMessage,
      sending,
      sendMessage,
    };
  },
})
export default class Home extends Vue {}
</script>
