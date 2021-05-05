<template>
  <div
    class="items-center w-full px-8 md:flex md:justify-center md:flex-row"
  >
    <div
      div
      class="relative border-8 selection-card"
      v-for="(slot, index) in userSlots"
      :key="users[slot] ? users[slot].id: slot"
    >
      <div
        class="absolute top-0 left-0 right-0 opacity-50"
        style="height: 10px;"
        :class="{
          'bg-green-600': registrations[index] === 'ACCEPTED',
          'bg-yellow-600': registrations[index] === 'JOINED',
        }"
      />
      <h2 class="mb-20 font-bold text-center">
        {{ $t("game.slot") }} {{ index + 1 }}
      </h2>

      <div v-if="!users[slot]">
        <div
          class="flex items-center justify-center flex-grow content"
          v-if="!isJoined"
        >
          <button class="button" @click="join()">
            {{ $t("game.join") }}
          </button>
        </div>
      </div>
      <div v-else>
        <div class="flex items-center justify-center flex-grow content">
          <UserSetting
            v-if="!rerender || users[slot].id === activeUserId"
            :minimal="true"
            :user="users[slot]"
          />
        </div>
        <div class="flex px-8 mt-20" v-if="users[slot].id === activeUserId">
          <button class="button-outline" @click="leave()">
            {{ $t("game.leave") }}
          </button>
          <div class="flex-grow" />
          <button
            class="button"
            @click="start()"
            v-if="registrations[index] === 'JOINED'"
          >
            {{ $t("game.start") }}
          </button>
          <button
            class="button"
            @click="stop()"
            v-if="registrations[index] === 'ACCEPTED'"
          >
            {{ $t("game.stop") }}
          </button>
        </div>
        <div class="flex mt-20" style="height: 42px" v-else />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { onUnmounted, ref } from '@vue/composition-api';
import { Component, Vue } from 'vue-property-decorator';
import {
  GameUserStatus,
  UserInterface,
  WsMessageType,
} from '@battletris/shared';

import UserSetting from '../components/UserSetting.vue';
import RoomConnection, { getCurrentConnection } from '../lib/RoomConnection';
import currUser from '../lib/User';
import ClassLogo from '../icons/ClassLogo.vue';

@Component({
  components: {
    ClassLogo,
    UserSetting,
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
    const userSlots = ref([0, 1, 2, 3, 4]);
    const rerender = ref(false);

    const updateGameUsers = () => {
      const userIds = Object.keys(conn.gameRegistration);
      users.value = userIds.map((userId) => conn.users[userId]);
      registrations.value = userIds.map(
        (userId) => conn.gameRegistration[userId],
      );
      isJoined.value = userIds.includes(currUser.id);
      // force update of other players
      rerender.value = true;
      setTimeout(() => (rerender.value = false), 0);
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
      rerender,
      start,
      stop,
      users,
      userSlots,
    };
  },
})
export default class GameRegistration extends Vue {}
</script>
