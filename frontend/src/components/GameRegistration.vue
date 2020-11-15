<template>
  <div class="grid h-full grid-cols-3 gap-6 p-6">
    <div
      class="flex flex-col flex-grow-0 flex-shrink-0 card"
      v-for="(regUser, index) in gameUsers"
      :key="index"
    >
      <h2 class="header">{{ $t("game.slot") }} {{ index + 1 }}</h2>

      <div class="flex items-center justify-center flex-grow content">
        <button
          class="button"
          @click="join(index)"
          v-if="!regUser && activeIndex === -1"
        >
          {{ $t("game.join") }}
        </button>
        <h2
          v-else-if="!regUser && activeIndex !== index"
          class="mt-6 font-bold text-center"
        >
          {{ $t("game.not-joined") }}
        </h2>
        <div v-else-if="regUser">
          <div
            class="flex items-center justify-center bg-gray-900 rounded-full"
            style="height: 160px; width: 160px"
          >
            <ClassLogo
              :className="getClassName(regUser.id)"
              width="100px"
              height="100px"
              color="#fff"
            />
          </div>
          <h2 class="mt-6 text-xl font-bold text-center">
            {{ getUserName(regUser.id) }}
          </h2>
        </div>
      </div>
      <div class="flex p-3" v-if="activeIndex === index">
        <button class="button-outline" @click="leave(index)">
          {{ $t("game.leave") }}
        </button>
        <div class="flex-grow" />
        <button class="button" @click="start(index)" v-if="regUser.status === 'JOINED'">
          {{ $t("game.start") }}
        </button>
        <button class="button" @click="stop(index)" v-if="regUser.status === 'ACCEPTED'">
          {{ $t("game.stop") }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { onUnmounted, ref } from '@vue/composition-api';
import { Component, Vue } from 'vue-property-decorator';
import { WsMessageType } from '@battletris/shared';

import GameUser from '@battletris/shared/interfaces/GameUser';
import ClassLogo from './ClassLogo.vue';
import RoomConnection, { getCurrentConnection } from '../lib/RoomConnection';

@Component({
  components: {
    ClassLogo,
  },
  props: {
    isOpen: { type: String },
  },
  setup() {
    const conn: RoomConnection = getCurrentConnection() as RoomConnection;
    const gameUsers = ref<GameUser[]>([]);
    const activeIndex = ref(-1);
    const loading = ref(true);

    const updateGameUsers = () => {
      gameUsers.value = [0, 1, 2, 3, 4, 5].map((index) => conn.room?.game.users[index] as GameUser);
      activeIndex.value = conn.activeIndex;
    };
    updateGameUsers();

    const join = (index: number) => conn.send(WsMessageType.GAME_JOIN, { index });
    const leave = () => conn.send(WsMessageType.GAME_LEAVE);
    const start = () => conn.send(WsMessageType.GAME_ACCEPT);
    const stop = () => conn.send(WsMessageType.GAME_CANCEL);
    conn.onMessage(async (type: number) => {
      switch (type) {
        case WsMessageType.USER_UPDATE:
        case WsMessageType.ROOM_JOIN:
        case WsMessageType.GAME_USER_UPDATE: {
          updateGameUsers();
          break;
        }
      }
    }, onUnmounted);

    const getUserName = (id: string) => conn.room?.users[id].name || id;
    const getClassName = (id: string) => conn.room?.users[id].className;

    return {
      activeIndex,
      gameUsers,
      getClassName,
      getUserName,
      join,
      leave,
      loading,
      start,
      stop,
    };
  },
})
export default class GameRegistration extends Vue {}
</script>
