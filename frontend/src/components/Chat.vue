<template>
  <div
    class="flex flex-col h-full py-3 pl-3"
    style="max-height: calc(100vh - 66px)"
  >
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
import { getCurrentConnection, WsMessageType } from '../lib/RoomConnection';

@Component({
  setup({ room }) {
    const chat = ref<string[]>([]);
    const conn = getCurrentConnection();
    if (conn) {
      const msgSubscriber = conn.onMessage((type: WsMessageType, payload: any) => {
        if (type === WsMessageType.CHAT) {
          const d = new Date();
          chat.value.unshift({
            ...payload,
            date: `${d.getHours()}:${d.getMinutes()}.${d.getSeconds()}`,
          });
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
    };
  },
})
export default class ClassLogo extends Vue {}
</script>
