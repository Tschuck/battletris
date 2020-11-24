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
        {{ regUser }}
        <div>x: {{ regUser.x }}</div>
        <div>y: {{ regUser.y }}</div>
        <div>rotation: {{ regUser.rotation }}</div>
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
    {{ activeIndex }}
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
import { mergeWith, update } from 'lodash';

import { formatGameUser, WsMessageType } from '@battletris/shared';
import { GameUserInterface } from '@battletris/shared/functions/gameUser';
import ClassLogo from './ClassLogo.vue';
import GameConnection from '../lib/GameConnection';
import currUser from '../lib/User';

@Component({
  components: {
    ClassLogo,
  },
  props: {
    roomId: { type: String },
  },
  setup(props) {
    const gameConn: GameConnection = new GameConnection(props.roomId as string);
    const gameUsers = ref<GameUserInterface[]>([]);
    const loading = ref(true);
    const messages = ref<any[]>([]);
    const activeIndex = ref<number>(-1);

    // bind key handler
    let keyPressed = false;
    const keyDownHandler = ($event: KeyboardEvent) => {
      // allow key press only each 50 ms
      if (keyPressed) {
        return;
      }

      gameConn.send(WsMessageType.GAME_INPUT, $event.keyCode);
    };
    const keyUpHandler = () => {
      keyPressed = true;
      setTimeout(() => keyPressed = false, 50);
    };

    const bindKeyPress = () => {
      window.addEventListener('keydown', keyDownHandler);
      window.addEventListener('keyup', keyUpHandler);
    };

    onUnmounted(() => {
      window.removeEventListener('keydown', keyDownHandler);
      window.removeEventListener('keyup', keyUpHandler);
    });

    gameConn.onMessage(async (type: WsMessageType, payload: any) => {
      switch (type) {
        case WsMessageType.GAME_UPDATE: {
          gameUsers.value = payload.users.map((user: any) => formatGameUser(user));
          // check if the user is part of the game
          activeIndex.value = gameUsers.value.findIndex((user) => user.id === currUser.id);
          // if the user has joined the game, bind key watchers
          if (activeIndex.value !== -1) {
            bindKeyPress();
          }

          loading.value = false;
          break;
        }
        case WsMessageType.GAME_USER_UPDATE: {
          loading.value = true;

          // iterate over all updated users and merge the user values
          Object.keys(payload as GameUserInterface[]).forEach((userIndex: any) => {
            const userUpdate = payload[userIndex] ? formatGameUser(payload[userIndex]) : { };

            /**
             * @param objValue The destination object
             * @param srcValue The source objects
             */
            gameUsers.value[userIndex] = mergeWith(
              gameUsers.value[userIndex],
              userUpdate,
              (objValue, srcValue, key) => {
                if (key === 'map' && Array.isArray(objValue)) {
                  srcValue.forEach((updatedRow: []|null, index: number) => {
                    if (updatedRow) {
                      // eslint-disable-next-line no-param-reassign
                      objValue[index] = updatedRow;
                    }
                  });

                  return objValue;
                }
              },
            );
          });

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
      activeIndex,
      loading,
      messages,
    };
  },
})
export default class Game extends Vue {}
</script>
