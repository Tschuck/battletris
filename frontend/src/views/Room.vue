<template>
  <ViewWrapper
    backRoute="/multi-player"
    :title="roomName"
    :showNav="!isMatchRunning"
  >
    <Loading class="mt-20" v-if="loading" />
    <template class="w-full vh-100" v-else>
      <GameRegistration v-if="!isMatchRunning" />
      <Game v-else :room-id="roomId" />

      <StopStatsModal :stopStats="stopStats" @close="stopStats = null" />
    </template>
  </ViewWrapper>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { onUnmounted, ref } from '@vue/composition-api';
import { WsMessageType } from '@battletris/shared';

import Chat from '../components/Chat.vue';
import currUser from '../lib/User';
import Game from '../game/Game.vue';
import GameRegistration from '../game/GameRegistration.vue';
import Loading from '../components/Loading.vue';
import RoomConnection from '../lib/RoomConnection';
import ViewWrapper from '../components/ViewWrapper.vue';
import Modal from '../components/Modal.vue';
import Tooltip from '../components/Tooltip.vue';
import ClassLogo from '../icons/ClassLogo.vue';
import StopStatsModal, { StopStatsInterface } from '../components/StopStatsModal.vue';

@Component({
  components: {
    Chat,
    ClassLogo,
    Game,
    GameRegistration,
    Loading,
    Modal,
    StopStatsModal,
    Tooltip,
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
    const stopStats = ref<StopStatsInterface | null>();

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
          }
          break;
        }
        case WsMessageType.GAME_REG_UPDATE: {
          isJoined.value = !!roomConn.gameRegistration[currUser.id];
          break;
        }
      }
    };
    roomConn.onMessage(
      (type, payload) => handleMessage(type, payload),
      onUnmounted,
    );

    onUnmounted(() => roomConn.disconnect());

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
      stopStats,
    };
  },
})
export default class RoomComponent extends Vue {}
</script>
