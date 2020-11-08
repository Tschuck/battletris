<template>
  <div class="h-full">
    <Loading v-if="loading" />
    <div class="grid h-full grid-cols-4 gap-6" v-else>
      <div class="flex flex-col py-3 pl-3 border-r border-gray-300 border-solid" style="max-height: calc(100vh - 66px);">
        <h2 class="pr-3 font-bold">{{ $t("lobby.title") }}</h2>

        <div class="flex-grow pr-3 overflow-y-auto">
          <div v-for="(message, index) in chat" :key="index" class="mt-3">
            <p class="text-sm">{{ message.message }}</p>
            <div class="flex text-xs italic text-gray-500">
              <p>{{ getUserName(message.id) }}</p>
              <p class="flex-grow" />
              <p>{{ message.date }}</p>
            </div>
          </div>
        </div>
        <div class="flex pr-3">
          <input
            class="flex-grow w-full px-3 py-2 mr-3 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
            v-model="newMessage"
            @keyup.enter="sendMessage"
            :placeholder="$t('lobby.chat-message')"
          />
          <button
            class="p-1 text-white bg-blue-900 rounded hover:bg-blue-800"
            @click="sendMessage"
            :disabled="sending"
          >
            {{ $t("lobby.send") }}
          </button>
        </div>
      </div>
      <div class="col-span-3">games</div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { ref } from '@vue/composition-api';

import RoomConnection, { WsMessageType } from '../lib/RoomConnection';
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
    const chat = ref<string[]>([]);

    let conn: RoomConnection;
    (async () => {
      // get general room data
      room.value = await getRequest(`room/${props.roomId}`);

      // connect to the websocket
      conn = await RoomConnection.connect(props.roomId as string, (data) => {
        const { type, payload } = data;

        console.log(data);
        switch (type) {
          case WsMessageType.CHAT: {
            const d = new Date();
            chat.value.unshift({
              ...payload,
              date: `${d.getHours()}:${d.getMinutes()}.${d.getSeconds()}`,
            });
            break;
          }
          case WsMessageType.ROOM_JOIN: {
            room.value.users[payload.userId] = payload.user;
            break;
          }
          case WsMessageType.USER_UPDATE: {
            room.value.users[payload.userId] = payload.user;
            break;
          }
          case WsMessageType.USER_LEAVE: {
            delete room.value.users[payload.userId];
            break;
          }
          default: {
            console.log(`${type} ws messages not implemented`);
          }
        }
      });

      // listen for keypress events
      // document.addEventListener('keypress', (e) => conn.send('keypress', e.code));
      loading.value = false;
    })();

    const newMessage = ref('');
    const sending = ref(false);
    const sendMessage = async (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
      sending.value = true;
      await conn.send(WsMessageType.CHAT, newMessage.value);
      newMessage.value = '';
      sending.value = false;
    };

    const getUserName = (id: string) => room.value?.users[id]?.name || id;

    return {
      chat,
      creating,
      getUserName,
      loading,
      newMessage,
      room,
      sending,
      sendMessage,
    };
  },
})
export default class RoomComponent extends Vue {}
</script>
