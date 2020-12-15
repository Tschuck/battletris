<template>
  <div class="grid h-full grid-cols-3 gap-6 p-6">
    <div
      class="flex flex-shrink-0 card"
      v-for="(regUser, index) in gameUsers"
      :key="index"
    >
      <GameField :roomId="roomId" :userId="regUser.id" :userData="regUser" :userIndex="index" />
    </div>
  </div>
</template>

<script lang="ts">
import { onUnmounted, ref } from '@vue/composition-api';
import { Component, Vue } from 'vue-property-decorator';

import { gameHelper, GameUser, WsMessageType } from '@battletris/shared';
import ClassLogo from '../general/ClassLogo.vue';
import currUser from '../../lib/User';
import GameConnection from '../../lib/GameConnection';
import GameField from './GameField.vue';

@Component({
  components: {
    ClassLogo,
    GameField,
  },
  props: {
    roomId: { type: String },
  },
  setup(props) {
    const gameConn: GameConnection = new GameConnection(props.roomId as string);
    const gameUsers = ref<GameUser[]>([]);
    const loading = ref(true);
    const messages = ref<any[]>([]);
    const activeIndex = ref<number>(-1);

    const messageHandler = gameConn.onMessage(async (type: WsMessageType, payload: any) => {
      switch (type) {
        case WsMessageType.GAME_UPDATE: {
          gameUsers.value = payload.users.map(
            (user: any) => gameHelper.transformUserTransport(user, {}),
          );
          // check if the user is part of the game
          activeIndex.value = gameUsers.value.findIndex((user) => user.id === currUser.id);
          loading.value = false;
          // we can unbind this listener, is just for the first sync
          messageHandler();
          break;
        }
      }
    }, onUnmounted);

    // just start the game. loading will be resolved, when game process responds with full game data
    gameConn.connect();

    return {
      gameUsers,
      activeIndex,
      loading,
      messages,
    };
  },
})
export default class Game extends Vue {}
</script>

<style lang="postcss">
  .konvajs-content {
    width: auto !important;
    height: auto !important;
  }
</style>
