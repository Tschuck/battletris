<template>
  <ViewWrapper
    :loading="loading"
    :route-name="roomName"
    :show-header="!isJoined || !isMatchRunning"
  >
    <template v-if="!loading">
      <div class="grid h-full grid-cols-4 gap-6">
        <div
          class="border-r border-solid bg-2"
          v-if="!isJoined || !isMatchRunning"
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

import Chat from '../components/room/Chat.vue';
import Game from '../components/game/Game.vue';
import GameRegistration from '../components/room/GameRegistration.vue';
import Loading from '../components/general/Loading.vue';
import RoomConnection from '../lib/RoomConnection';
import ViewWrapper from '../components/ViewWrapper.vue';
import currUser from '../lib/User';

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
    const isJoined = ref(false);

    const handleMessage = (type: WsMessageType) => {
      switch (type) {
        case WsMessageType.GAME_STARTED:
        case WsMessageType.GAME_STOP: {
          isMatchRunning.value = roomConn?.isMatchRunning;
          break;
        }
        case WsMessageType.GAME_REG_UPDATE: {
          isJoined.value = !!roomConn.gameRegistration[currUser.id];
          break;
        }
      }
    };
    roomConn.onMessage((type) => handleMessage(type), onUnmounted);

    (async () => {
      await roomConn.connect();
      roomName.value = roomConn.name;
      isJoined.value = !!roomConn.gameRegistration[currUser.id];
      isMatchRunning.value = roomConn?.isMatchRunning;
      loading.value = false;
    })();

    return {
      creating,
      isJoined,
      isMatchRunning,
      loading,
      roomName,
    };
  },
})
export default class RoomComponent extends Vue {}
</script>
