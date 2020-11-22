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
      <div v-if="!loading">
        <div
          class="grid w-auto grid-cols-10 gap-0 border-solid "
          v-for="(row, rowIndex) in regUser.map"
          :key="rowIndex"
        >
          <div
            v-for="(col, colIndex) in row"
            :key="colIndex"
            class="w-6 h-6 border border-solid"
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
import { merge } from 'lodash';

import { WsMessageType } from '@battletris/shared';
import ClassLogo from './ClassLogo.vue';
import GameConnection from '../lib/GameConnection';

@Component({
  components: {
    ClassLogo,
  },
  props: {
    roomId: { type: String },
  },
  setup(props) {
    const gameConn: GameConnection = new GameConnection(props.roomId as string);
    const gameUsers = ref<any[]>([]);
    const loading = ref(true);
    const messages = ref<any[]>([]);

    gameConn.onMessage(async (type: WsMessageType, payload: any) => {
      switch (type) {
        case WsMessageType.GAME_UPDATE: {
          gameUsers.value = payload.users;
          loading.value = false;
          break;
        }
        case WsMessageType.GAME_USER_UPDATE: {
          loading.value = true;
          gameUsers.value = merge(gameUsers.value, payload);
          setTimeout(() => {
            loading.value = false;
          });
          break;
        }
      }
    }, onUnmounted);

    // just start the game. loading will be resolved, when game process responds with full game data
    gameConn.connect();

    return {
      gameUsers,
      loading,
      messages,
    };
  },
})
export default class Game extends Vue {}
</script>
