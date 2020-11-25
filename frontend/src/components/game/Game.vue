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
import { mergeWith, update } from 'lodash';

import { formatGameUser, WsMessageType } from '@battletris/shared';
import { GameUserInterface } from '@battletris/shared/functions/gameUser';
import ClassLogo from '../general/ClassLogo.vue';
import GameConnection from '../../lib/GameConnection';
import currUser from '../../lib/User';
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

    const messageHandler = gameConn.onMessage(async (type: WsMessageType, payload: any) => {
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
