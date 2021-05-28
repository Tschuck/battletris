<template>
  <div class="w-full">
    <div class="flex items-center justify-center h-128" style="height: 50%" v-if="starting">
      <Loading  />
    </div>
    <div class="flex items-center justify-center h-full" v-else-if="!isMatchRunning">
      <button class="button" @click="startTestGame()">
        {{ $t("laboratory.start-test-game") }}
      </button>
    </div>
    <Game :room-id="currUserId" v-else />
    <StopStatsModal :stopStats="stopStats" @close="stopStats = null" />
  </div>
</template>

<script lang="ts">
import { onUnmounted, ref } from '@vue/composition-api';
import { Component, Vue } from 'vue-property-decorator';

import { WsMessageType } from '@battletris/shared';
import currUser from '../lib/User';
import Game from '../game/Game.vue';
import RoomConnection from '../lib/RoomConnection';
import StopStatsModal, { StopStatsInterface } from './StopStatsModal.vue';
import Loading from './Loading.vue';

@Component({
  components: {
    Game,
    Loading,
    StopStatsModal,
  },
  props: {
    onStart: { type: Function },
  },
  setup(props: { onStart: () => Promise<void> }) {
    const currUserId = currUser.id;
    const isMatchRunning = ref(false);
    const roomConn = new RoomConnection(currUserId as string);
    const stopStats = ref<StopStatsInterface | null>();
    const starting = ref(false);

    const handleMessage = (type: WsMessageType, payload: any) => {
      switch (type) {
        case WsMessageType.GAME_STARTED:
        case WsMessageType.GAME_STOP: {
          isMatchRunning.value = roomConn?.isMatchRunning;

          if (type === WsMessageType.GAME_STOP) {
            isMatchRunning.value = false;
            const {
              started, stopped, users, winner,
            } = payload;
            const userIds = Object.keys(users);
            const duration = new Date(stopped).getTime() - new Date(started).getTime();
            // create stop stats to show the finish modal
            stopStats.value = {
              duration: Math.round((duration / 1000 / 60) * 10) / 10,
              users: userIds.map((userId: any) => {
                const userStats = users[userId];

                return {
                  blockCount: userStats.blockCount,
                  className: userStats.className,
                  isWinner: userId === winner,
                  name: roomConn.users[userId].name,
                  rowCount: userStats.rowCount,
                };
              }),
            };
          } else {
            starting.value = false;
          }
          break;
        }
      }
    };

    roomConn.onMessage(
      (type, payload) => handleMessage(type, payload),
      onUnmounted,
    );

    onUnmounted(() => roomConn.disconnect());

    const startTestGame = async () => {
      starting.value = true;

      await props.onStart();
      await roomConn.send(WsMessageType.GAME_JOIN);
      await roomConn.send(WsMessageType.GAME_ACCEPT);
    };

    (async () => {
      await roomConn.connect();
      isMatchRunning.value = roomConn?.isMatchRunning;
    })();

    return {
      currUserId,
      isMatchRunning,
      roomConn,
      starting,
      startTestGame,
      stopStats,
    };
  },
})
export default class SinglePlayer extends Vue { }
</script>

<style lang="postcss">
.konvajs-content {
  width: auto !important;
  height: auto !important;
}
</style>
