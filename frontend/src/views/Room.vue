<template>
  <div class="home">
    <Loading v-if="loading" />
    <div v-else>
      <h1>{{ room }}</h1>

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

import RoomConnection from '../lib/RoomConnection';
import Loading from '../components/Loading.vue';
import { getRequest } from '../lib/request';

@Component({
  components: {
    Loading,
  },
  props: {
    roomId: { type: String },
  },
  setup(props) {
    const loading = ref(true);
    const creating = ref(false);
    const room = ref<any | null>(null);
    const messages = ref<string[]>([]);

    let conn: RoomConnection;
    (async () => {
      // connect to the websocket
      conn = await RoomConnection.connect(
        props.roomId as string,
        (data) => {
          messages.value.push(data);
        },
      );

      // get general room data
      room.value = await getRequest(`room/${props.roomId}`);
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
      room,
      loading,
      messages,
      // for sending chat messages
      newMessage,
      sending,
      sendMessage,
    };
  },
})
export default class RoomComponent extends Vue {}
</script>
