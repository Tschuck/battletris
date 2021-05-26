<template>
  <div class="grid h-full grid-cols-3 gap-6 p-6">
    <template v-if="!isTestGame">
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
          :activeUserIndex="activeIndex"
          :gameUserCount="gameUsers.length"
          :roomId="roomId"
          :userData="gameUsers[userIndex]"
          :userId="gameUsers[userIndex].id"
          :userIndex="userIndex"
        />
        <div style="border: 5px solid var(--bg-1)" v-else />
      </div>
    </template>
    <GameField
      class="col-span-6"
      v-else-if="activeIndex !== -1"
      :activeUserIndex="activeIndex"
      :gameUserCount="gameUsers.length"
      :roomId="roomId"
      :userData="gameUsers[activeIndex]"
      :userId="gameUsers[activeIndex].id"
      :userIndex="activeIndex"
    />
  </div>
</template>

<script lang="ts">
import { onBeforeUnmount, onUnmounted, ref } from '@vue/composition-api';
import { Component, Vue } from 'vue-property-decorator';

import {
  gameHelper, GameUser, WsMessageType,
} from '@battletris/shared';
import currUser from '../lib/User';
import GameConnection from '../lib/Gameconnection';
import GameField from './GameField.vue';
import GameRegistry from './GameRegistry';

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
    const isTestGame = ref(props.roomId === currUser.id);

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

    // cleanup game registry to save memory
    onBeforeUnmount(() => {
      while (GameRegistry.length) {
        GameRegistry.pop();
      }
    });

    return {
      activeIndex,
      gameUsers,
      isTestGame,
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
