<template>
  <div class="grid h-full grid-cols-3 gap-6 p-6">
    <div
      class="flex flex-shrink-0 bg-2"
      v-for="(userIndex, index) in sortedGameUsers"
      :class="{
        'row-span-2': index === 1
      }"
      :key="index"
    >
      <GameField
        v-if="gameUsers[userIndex]"
        :roomId="roomId"
        :userId="gameUsers[userIndex].id"
        :userData="gameUsers[userIndex]"
        :userIndex="userIndex"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { onUnmounted, ref } from '@vue/composition-api';
import { Component, Vue } from 'vue-property-decorator';

import { gameHelper, GameUser, WsMessageType } from '@battletris/shared';
import currUser from '../lib/User';
import GameConnection from '../lib/GameConnection';
import GameField from './GameField.vue';

@Component({
  components: {
    GameField,
  },
  props: {
    roomId: { type: String },
  },
  setup(props) {
    const gameConn: GameConnection = new GameConnection(props.roomId as string);
    const gameUsers = ref<(GameUser|null)[]>([]);
    const sortedGameUsers = ref<number[]>([]);
    const loading = ref(true);
    const messages = ref<any[]>([]);
    const activeIndex = ref<number>(-1);

    const messageHandler = gameConn.onMessage(
      async (type: WsMessageType, payload: any) => {
        switch (type) {
          case WsMessageType.GAME_UPDATE: {
            gameUsers.value = payload.users.map(
              (user: any) => gameHelper.transformUserTransport(user, {}),
            );
            sortedGameUsers.value = [0, 1, 2, 3, 4];

            // check if the user is part of the game
            activeIndex.value = gameUsers.value.findIndex(
              (user) => user?.id === currUser.id,
            );

            // move active user to third position for better game experience
            if (activeIndex.value !== -1) {
              const [sortIndex] = sortedGameUsers.value.splice(activeIndex.value, 1);
              sortedGameUsers.value.splice(1, 0, sortIndex);
            }
            loading.value = false;
            // we can unbind this listener, is just for the first sync
            messageHandler();
            break;
          }
        }
      },
      onUnmounted,
    );

    // just start the game. loading will be resolved, when game process responds with full game data
    gameConn.connect();

    return {
      activeIndex,
      gameUsers,
      loading,
      messages,
      sortedGameUsers,
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
