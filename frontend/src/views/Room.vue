<template>
  <ViewWrapper :loading="loading" :route-name="roomName">
    <template v-if="!loading">
      <div class="grid h-full grid-cols-4 gap-6">
        <div
          class="border-r border-solid bg-2"
          v-if="activeIndex === -1 || !isMatchRunning"
        >
          <Chat />
        </div>
        <div class="col-span-3">
          <GameRegistration v-if="!isMatchRunning" />
          <Game v-else :room-id="roomId" />
        </div>
      </div>
    </template>
  </ViewWrapper>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { onUnmounted, ref } from '@vue/composition-api';
import { WsMessageType } from '@battletris/shared';

import Chat from '../components/Chat.vue';
import Game from '../components/Game.vue';
import GameRegistration from '../components/GameRegistration.vue';
import Loading from '../components/Loading.vue';
import RoomConnection from '../lib/RoomConnection';
import ViewWrapper from '../components/ViewWrapper.vue';

@Component({
  components: {
    Chat,
    Game,
    GameRegistration,
    Loading,
    ViewWrapper,
  },
  props: {
    roomId: { type: String },
  },
  setup(props) {
    const loading = ref(true);
    const creating = ref(false);
    const roomName = ref<string>('');
    const roomConn = new RoomConnection(props.roomId as string);
    const isMatchRunning = ref(false);
    const activeIndex = ref(-1);

    const handleMessage = (type: WsMessageType) => {
      if (type === WsMessageType.GAME_STARTED) {
        isMatchRunning.value = roomConn?.isMatchRunning;
      }
    };
    roomConn.onMessage((type) => handleMessage(type), onUnmounted);

    (async () => {
      await roomConn.connect();
      roomName.value = roomConn.name;
      loading.value = false;
    })();

    return {
      activeIndex,
      creating,
      isMatchRunning,
      loading,
      roomName,
    };
  },
})
export default class RoomComponent extends Vue {}
</script>
