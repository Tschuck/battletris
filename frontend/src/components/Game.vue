<template>
  <div class="grid h-full grid-cols-3 gap-6 p-6">
    <div
      class="flex flex-shrink-0 card"
      v-for="(regUser, index) in gameUsers"
      :key="index"
    >
      <!-- <h2 class="header">{{ $t("game.slot") }} {{ index + 1 }}</h2>

      <div class="flex items-center justify-center flex-grow content">
        {{ regUser.name }}
      </div> -->
      <div>
        <div
          class="grid w-auto grid-cols-10 gap-0 border-solid "
          v-for="(row, rowIndex) in regUser.map"
          :key="rowIndex"
        >
          <div
            v-for="(col, colIndex) in row"
            :key="colIndex"
            class="w-6 h-6 border border-gray-300 border-solid"
            :class="{ 'bg-gray-700': col }"
          ></div>
        </div>
      </div>
    </div>
    <!--
    <div
      class="flex flex-col flex-grow-0 flex-shrink-0 card"
      v-for="(message, index) in messages"
      :key="index"
    >
      {{ message }}
    </div> -->
  </div>
</template>

<script lang="ts">
import { onUnmounted, ref } from '@vue/composition-api';
import { Component, Vue } from 'vue-property-decorator';

import { GameUserInterface } from '@battletris/shared/interfaces/GameUser';
import { WsMessageType } from '@battletris/shared';
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
    const gameUserIndex = ref(conn.activeIndex);
    const gameUsers = ref<GameUserInterface[]>([]);
    const loading = ref(true);
    const messages = ref<any[]>([]);

    const updateUsers = () => {
      const filteredUsers = conn.room?.game.users.filter((user) => !!user);
      gameUsers.value = filteredUsers as GameUserInterface[];
    };
    updateUsers();
    conn.onMessage(async (type: number) => {
      if (type === WsMessageType.GAME_USER_UPDATE) {
        updateUsers();
      }
    }, onUnmounted);

    return {
      gameUserIndex,
      gameUsers,
      loading,
      messages,
    };
  },
})
export default class Game extends Vue {}
</script>
