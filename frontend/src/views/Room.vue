<template>
  <ViewWrapper backRoute="/multi-player">
    <Loading v-if="loading" />
    <div class="grid w-full h-full grid-cols-4 gap-6" v-else>
      <div
        class="border-r border-solid"
        v-if="!isJoined || !isMatchRunning"
      >
        <Chat />
      </div>
      <div class="col-span-3">
        <GameRegistration v-if="!isMatchRunning" />
        <Game v-else :room-id="roomId" />
      </div>
    </div>
  </ViewWrapper>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { onUnmounted, ref } from '@vue/composition-api';
import { WsMessageType } from '@battletris/shared';

import Chat from '../components/room/Chat.vue';
import currUser from '../lib/User';
import Game from '../components/game/Game.vue';
import GameRegistration from '../components/room/GameRegistration.vue';
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
