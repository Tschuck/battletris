<template>
  <div
    class="flex flex-col h-full py-3 pl-3"
    style="max-height: calc(100vh - 66px)"
  >
    <h2 class="pr-3 font-bold">{{ $t("lobby.title") }}</h2>

    <div class="p-1 mt-3 mr-3 overflow-y-auto border border-gray-600">
      <span v-for="(name, index) in usersInLobby" :key="index">
        <span class="text-sm">{{ index !== 0 ? ',' : '' }} {{ name }}</span>
      </span>
    </div>

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
        class="button"
        @click="sendMessage"
        :disabled="sending"
      >
        {{ $t("lobby.send") }}
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { onUnmounted, ref } from '@vue/composition-api';
import { WsMessageType } from '@battletris/shared';

import { getCurrentConnection } from '../lib/RoomConnection';

@Component({
  setup() {
    const chat = ref<any[]>([]);
    const conn = getCurrentConnection();
    const usersInLobby = ref<string[]>([]);

    const setUsersInLobby = () => {
      usersInLobby.value = Object
        .keys(conn?.room?.users || {})
        .map((userId) => conn?.room?.users[userId].name) as string[];
    };
    setUsersInLobby();

    if (conn) {
      const msgSubscriber = conn.onMessage((type: WsMessageType, payload: any) => {
        const d = new Date();
        const timeString = `${d.getHours()}:${d.getMinutes()}.${d.getSeconds()}`;
        switch (type) {
          case WsMessageType.CHAT: {
            chat.value.unshift({
              ...payload,
              date: timeString,
            });
            break;
          }
          case WsMessageType.ROOM_JOIN: {
            setUsersInLobby();
            break;
          }
          case WsMessageType.ROOM_LEAVE: {
            setUsersInLobby();
            break;
          }
        }
      });

      // stop listening
      onUnmounted(() => msgSubscriber());
    }

    const newMessage = ref('');
    const sending = ref(false);
    const getUserName = (id: string) => conn?.room?.users[id]?.name || id;
    const sendMessage = async (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
      sending.value = true;
      await conn?.send(WsMessageType.CHAT, newMessage.value);
      newMessage.value = '';
      sending.value = false;
    };

    return {
      chat,
      getUserName,
      newMessage,
      sending,
      sendMessage,
      usersInLobby,
    };
  },
})
export default class ClassLogo extends Vue {}
</script>
