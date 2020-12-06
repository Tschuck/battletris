<template>
  <div class="grid h-full grid-cols-3 gap-6 p-6">
    <div
      class="flex flex-col flex-grow-0 flex-shrink-0 card"
      v-for="(user, index) in users"
      :key="user.id"
    >
      <h2 class="header">{{ $t("game.slot") }} {{ index + 1 }}</h2>

      <div class="flex items-center justify-center flex-grow content">
        <div>
          <div
            class="flex items-center justify-center rounded-full"
          >
            <ClassLogo
              v-if="user"
              :className="user.className"
              width="100px"
              height="100px"
              color="#fff"
            />
          </div>
          <h2 class="mt-6 overflow-hidden text-xl font-bold text-center">
            {{ user.name }}
          </h2>
        </div>
      </div>
      <div class="flex p-3" v-if="user.id === activeUserId">
        <button class="button-outline" @click="leave()">
          {{ $t("game.leave") }}
        </button>
        <div class="flex-grow" />
        <button class="button" @click="start()" v-if="registrations[index] === 'JOINED'">
          {{ $t("game.start") }}
        </button>
        <button class="button" @click="stop()" v-if="registrations[index] === 'ACCEPTED'">
          {{ $t("game.stop") }}
        </button>
      </div>
    </div>

    <div
      class="flex flex-col flex-grow-0 flex-shrink-0 card"
      v-if="users.length < 6 && !isJoined"
    >
      <h2 class="header">{{ $t("game.slot") }} {{ users.length + 1 }}</h2>

      <div class="flex items-center justify-center flex-grow content">
        <button
          class="button"
          @click="join()"
        >
          {{ $t("game.join") }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { onUnmounted, ref } from '@vue/composition-api';
import { Component, Vue } from 'vue-property-decorator';
import { GameUserStatus, UserInterface, WsMessageType } from '@battletris/shared';

import ClassLogo from '../general/ClassLogo.vue';
import RoomConnection, { getCurrentConnection } from '../../lib/RoomConnection';
import currUser from '../../lib/User';

@Component({
  components: {
    ClassLogo,
  },
  props: {
    isOpen: { type: String },
  },
  setup() {
    const activeUserId = ref(currUser.id);
    const conn: RoomConnection = getCurrentConnection() as RoomConnection;
    const isJoined = ref(false);
    const loading = ref(true);
    const registrations = ref<GameUserStatus[]>([]);
    const users = ref<UserInterface[]>([]);

    const updateGameUsers = () => {
      const userIds = Object.keys(conn.gameRegistration);
      users.value = userIds.map((userId) => conn.users[userId]);
      registrations.value = userIds.map((userId) => conn.gameRegistration[userId]);
      isJoined.value = userIds.includes(currUser.id);
    };
    updateGameUsers();

    const join = () => conn.send(WsMessageType.GAME_JOIN);
    const leave = () => conn.send(WsMessageType.GAME_LEAVE);
    const start = () => conn.send(WsMessageType.GAME_ACCEPT);
    const stop = () => conn.send(WsMessageType.GAME_CANCEL);
    conn.onMessage(async (type: number) => {
      switch (type) {
        case WsMessageType.USER_UPDATE:
        case WsMessageType.ROOM_JOIN:
        case WsMessageType.GAME_REG_UPDATE: {
          updateGameUsers();
          break;
        }
      }
    }, onUnmounted);

    return {
      activeUserId,
      isJoined,
      join,
      leave,
      loading,
      registrations,
      start,
      stop,
      users,
    };
  },
})
export default class GameRegistration extends Vue {}
</script>
