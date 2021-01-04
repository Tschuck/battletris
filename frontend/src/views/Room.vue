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

      <Modal
        class="text-gray-300"
        :show="!!stopStats"
        @close="stopStats = null"
        v-if="stopStats"
      >
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-xl font-bold">{{ $t("game.finished") }}</h2>
          <p class="text-xs">
            {{ $t("classes.duration") }}:
            {{ stopStats.duration }}
            {{ $t("game.min-short") }}
          </p>
        </div>

        <div
          class="flex mt-3 bg-2"
          v-for="(userStat, index) in stopStats.users"
          :key="index"
        >
          <div
            class="w-3 bg-green-300 bg-opacity-50"
            v-if="userStat.isWinner"
          />
          <div class="w-3 bg-red-300 bg-opacity-50" v-else />
          <ClassLogo
            class="flex items-center justify-center p-2 ml-3"
            :className="userStat.className"
            :width="'50px'"
          />
          <div class="flex flex-col justify-center p-3">
            <h3>{{ userStat.name }}</h3>
            <div class="flex items-center justify-between mt-1">
              <span class="tooltip-box">
                <font-awesome-icon class="text-lg" icon="th-large" />
                {{ userStat.blockCount }}
                <Tooltip
                  class="bg-1"
                  :value="$t('classes.block-count-tooltip')"
                  style="width: 200px"
                />
              </span>
              <span class="ml-3 tooltip-box">
                <font-awesome-icon class="text-lg" icon="chart-line" />
                {{ userStat.rowCount }}
                <Tooltip
                  class="bg-1"
                  :value="$t('classes.row-count-tooltip')"
                  style="width: 200px"
                />
              </span>
            </div>
          </div>
          <span class="flex items-center justify-end flex-grow mr-5 font-bold" v-if="userStat.isWinner">{{
            $t("game.winner")
          }}</span>
        </div>

        <div class="mt-3 text-center">
          <button class="button" @click="stopStats = null">
            {{ $t("close") }}
          </button>
        </div>
      </Modal>
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

interface StopStatsInterface {
  // game duration in minutes
  duration: number;
  // list of user stats
  users: {
    isWinner: boolean;
    name: string;
    blockCount: number;
    rowCount: number;
    className: string;
  }[];
}

@Component({
  components: {
    Chat,
    ClassLogo,
    Game,
    GameRegistration,
    Loading,
    Modal,
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
            const duration = new Date(started).getDate() - new Date(stopped).getDate();
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
