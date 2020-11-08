<template>
  <div class="grid h-full grid-cols-3 gap-6 p-6">
    <div class="flex flex-col card" v-for="(user, index) in gameUsers" :key="index">
      <h2 class="header">
        {{ $t('game.slot') }} {{ index + 1 }}
      </h2>

      <div class="flex items-center flex-grow m-auto content"
        v-if="!user">
        <button class="button" @click="join(index)">
          {{ $t('game.join' )}}
        </button>
      </div>
      <div class="flex items-center flex-grow m-auto content"
        v-else>
        <div>
          <h2>{{ user.name }}</h2>
          <p>{{ user.className }}</p>
          {{ user.id }}

          <button class="button"
            @click="leave(index)"
            v-if="activeUserId.startsWith(user.id)">
            {{ $t('game.leave' )}}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { onUnmounted, ref } from '@vue/composition-api';
import { Component, Vue } from 'vue-property-decorator';
import { merge } from 'lodash';

import user from '../lib/User';
import RoomConnection, { getCurrentConnection, WsMessageType } from '../lib/RoomConnection';

@Component({
  props: {
    isOpen: { type: String },
  },
  setup() {
    const conn: RoomConnection = getCurrentConnection() as RoomConnection;
    const game = conn?.room?.game;
    const gameUsers = ref<any[]>([]);
    const render = ref(true);
    const activeUserId = ref(user.userId);

    const userPlaces = [0, 1, 2, 3, 4, 5];
    const updateGameUsers = () => {
      gameUsers.value = userPlaces.map((index) => {
        if (game.users[index]) {
          return conn?.room?.users[game.users[index].userId];
        }
        return null;
      });
    };
    updateGameUsers();

    const join = (index: number) => conn?.send(WsMessageType.GAME_JOIN, { index });
    const leave = (index: number) => conn?.send(WsMessageType.GAME_LEAVE, { index });
    const msgSubscriber = conn?.onMessage(async (type: number, payload: any) => {
      if (type === WsMessageType.GAME_USER_UPDATE) {
        game.users = merge(game.users, payload);
        updateGameUsers();
        // // force rerendering
        // render.value = false;
        // await new Promise((resolve) => setTimeout(resolve, 0));
        // render.value = true;
      }
    });
    // stop listening
    onUnmounted(() => msgSubscriber && msgSubscriber());

    return {
      activeUserId,
      gameUsers,
      join,
      leave,
      render,
      userPlaces,
    };
  },
})
export default class ClassLogo extends Vue {}
</script>
