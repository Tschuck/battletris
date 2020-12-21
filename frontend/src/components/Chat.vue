<template>
  <div class="flex flex-col h-full py-3 pl-3 bg-2">
    <h2 class="pr-3 font-bold">{{ $t("lobby.title") }}</h2>

    <div class="p-1 mt-3 mr-3 overflow-y-auto border">
      <span v-for="(name, index) in usersInLobby" :key="index" style="min-height: 24px">
        <span class="overflow-hidden text-sm">{{ index !== 0 ? ',' : '' }} {{ name }}</span>
      </span>
    </div>

    <div class="flex-grow pr-3 overflow-y-auto">
      <div v-for="(message, index) in chat" :key="index" class="mt-3">
        <p class="text-sm">{{ message.message }}</p>
        <div class="flex text-xs italic opacity-50">
          <p class="overflow-hidden">{{ getUserName(message.id) }}</p>
          <p class="flex-grow" />
          <p>{{ message.date }}</p>
        </div>
      </div>
    </div>
    <div class="flex pr-3">
      <input
        class="flex-grow w-full px-3 py-2 mr-3 leading-tight border rounded shadow appearance-none bg-1 focus:outline-none focus:shadow-outline"
        v-model="newMessage"
        @keyup.enter="sendMessage"
        :placeholder="$t('lobby.chat-message')"
      />
      <button
        class="button bg-1"
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
  setup(props, { root }) {
    const chat = ref<any[]>([]);
    const conn = getCurrentConnection();
    const usersInLobby = ref<string[]>([]);

    const setUsersInLobby = () => {
      usersInLobby.value = Object
        .keys(conn?.users || {})
        .map((userId) => conn?.users[userId].name) as string[];
    };
    setUsersInLobby();

    const addChatMsg = (userId: string, message: string) => {
      const d = new Date();
      const timeString = [
        d.getHours().toString().padStart(2, '0'),
        d.getMinutes().toString().padStart(2, '0'),
        d.getSeconds().toString().padStart(2, '0'),
      ].join(':');
      chat.value.unshift({
        id: userId,
        message,
        date: timeString,
      });
    };

    if (conn) {
      conn.onMessage((type: WsMessageType, payload: any) => {
        switch (type) {
          case WsMessageType.CHAT: {
            addChatMsg(payload.id, payload.message);
            break;
          }
          case WsMessageType.GAME_STATS: {
            addChatMsg('', payload.message);
            break;
          }
          case WsMessageType.USER_UPDATE:
          case WsMessageType.ROOM_JOIN: {
            setUsersInLobby();
            break;
          }
          case WsMessageType.ROOM_LEAVE: {
            setUsersInLobby();
            break;
          }
          case WsMessageType.GAME_STOP: {
            addChatMsg('', root.$i18n.t('game.ends', {
              winner: conn?.users[payload?.winner].name,
            }));
            break;
          }
        }
      }, onUnmounted);
    }

    const newMessage = ref('');
    const sending = ref(false);
    const getUserName = (id: string) => conn?.users[id]?.name || id;
    const sendMessage = async (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
      sending.value = true;
      await conn?.send(WsMessageType.CHAT, newMessage.value.slice(0, 100));
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
