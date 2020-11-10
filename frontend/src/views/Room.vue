<template>
  <ViewWrapper :loading="loading">
    <template v-if="!loading">
      <div class="grid h-full grid-cols-4 gap-6">
        <div
          class="border-r border-gray-300 border-solid"
          v-if="!room.isMatchRunning || room.activeIndex !== -1"
        >
          <Chat />
        </div>
        <div class="col-span-3">
          <GameRegistration v-if="!room.isMatchRunning" />
          <Game v-else />
        </div>
      </div>
    </template>
  </ViewWrapper>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { onUnmounted, ref } from '@vue/composition-api';
import { RoomWithDataInterface, WsMessageType } from '@battletris/shared';

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
    const room = ref<RoomWithDataInterface | null>(null);
    const conn = new RoomConnection(props.roomId as string);

    conn.onMessage((type: number) => {
      if (type === WsMessageType.GAME_START && room.value) {
        room.value.isMatchRunning = true;
      }
    }, onUnmounted);

    (async () => {
      await conn.connect();
      room.value = conn.room;
      loading.value = false;
    })();

    return {
      creating,
      loading,
      room,
    };
  },
})
export default class RoomComponent extends Vue {}
</script>
