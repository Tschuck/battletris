<template>
  <div class="grid h-full grid-cols-3 gap-6 p-6">
    <div
      class="flex flex-col flex-grow-0 flex-shrink-0 card"
      v-for="(regUser, index) in gameUsers"
      :key="index"
    >
      <h2 class="header">{{ $t("game.slot") }} {{ index + 1 }}</h2>

      <div class="flex items-center justify-center flex-grow content">
        {{regUser.name}}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { onUnmounted, ref } from '@vue/composition-api';
import { Component, Vue } from 'vue-property-decorator';

import GameUser from '@battletris/shared/interfaces/GameUser';
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
    const gameUsers = ref<GameUser[]>(conn.room?.game.users as GameUser[]);
    const loading = ref(true);
    const gameUserIndex = ref(conn.activeIndex);

    conn.onMessage(async (type: number, payload: any) => {
      console.log(`${type}: ${payload}`);
    }, onUnmounted);

    return {
      gameUserIndex,
      gameUsers,
      loading,
    };
  },
})
export default class Game extends Vue {}
</script>
