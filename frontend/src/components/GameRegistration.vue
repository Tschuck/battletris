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
          v-if="!regUser && isJoined === -1"
        >
          {{ $t("game.join") }}
        </button>
        <h2
          v-else-if="!regUser && isJoined !== index"
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
              :className="regUser.className"
              width="100px"
              height="100px"
              color="#fff"
            />
          </div>
          <h2 class="mt-6 text-xl font-bold text-center">
            {{ regUser.name }}
          </h2>
        </div>
      </div>
      <div class="flex p-3" v-if="isJoined === index">
        <button class="button-outline" @click="leave(index)">
          {{ $t("game.leave") }}
        </button>
        <div class="flex-grow" />
        <button class="button" @click="start(index)">
          {{ $t("game.start") }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { onUnmounted, ref } from '@vue/composition-api';
import { Component, Vue } from 'vue-property-decorator';
import { merge } from 'lodash';

import ClassLogo from './ClassLogo.vue';
import user from '../lib/User';
import RoomConnection, {
  getCurrentConnection,
  WsMessageType,
} from '../lib/RoomConnection';

@Component({
  components: {
    ClassLogo,
  },
  props: {
    isOpen: { type: String },
  },
  setup() {
    const conn: RoomConnection = getCurrentConnection() as RoomConnection;
    const game = conn?.room?.game;
    const gameUsers = ref<any[]>([]);
    const loading = ref(true);
    const activeUserId = ref(user.userId);
    const isJoined = ref(-1);

    const userPlaces = [0, 1, 2, 3, 4, 5];
    const updateGameUsers = () => {
      gameUsers.value = userPlaces.map((index) => {
        if (game.users[index]) {
          return conn?.room?.users[game.users[index].userId];
        }
        return null;
      });
      isJoined.value = game.users.findIndex((regUser: any) => user.userId.startsWith(regUser?.userId));
    };
    updateGameUsers();

    const join = (index: number) => conn?.send(WsMessageType.GAME_JOIN, { index });
    const leave = (index: number) => conn?.send(WsMessageType.GAME_LEAVE, { index });
    const msgSubscriber = conn?.onMessage(
      async (type: number, payload: any) => {
        switch (type) {
          case WsMessageType.USER_UPDATE:
          case WsMessageType.ROOM_JOIN: {
            updateGameUsers();
            break;
          }
          case WsMessageType.GAME_USER_UPDATE: {
            game.users = merge(game.users, payload);
            updateGameUsers();
            break;
          }
        }
      }
    );
    // stop listening
    onUnmounted(() => msgSubscriber && msgSubscriber());

    return {
      activeUserId,
      gameUsers,
      isJoined,
      join,
      leave,
      loading,
      userPlaces,
    };
  },
})
export default class GameRegistration extends Vue {}
</script>
