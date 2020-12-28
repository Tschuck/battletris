<template>
  <ViewWrapper :title="$t('start-page.single-player')" :showNav="!started">
    <div class="flex items-center h-full" v-if="!started">
      <button class="button bg-2:hover" @click="startGame()">
        {{ $t("game.start-game") }}
      </button>
    </div>
    <div class="h-full grid-cols-3 gap-6 p-6 xl:grid" v-else>
      <div />
      <div class="flex flex-shrink-0 h-full row-span-2 bg-2">
        <GameField :userData="userData" :userIndex="0" :offline="true" />
      </div>
    </div>
  </ViewWrapper>
</template>

<script lang="ts">
import { onUnmounted, ref } from '@vue/composition-api';
import { Component, Vue } from 'vue-property-decorator';
import ViewWrapper from '../components/ViewWrapper.vue';
import user from '../lib/User';
import GameField from '../game/GameField.vue';

@Component({
  components: {
    GameField,
    ViewWrapper,
  },
  setup() {
    const started = ref(false);
    const userData = ref();

    // start a single-player game
    const startGame = () => {
      userData.value = { speed: 1100, ...user };
      started.value = true;
    };

    // create seperate function for removing the event listener
    const gameCloseListener = () => {
      started.value = false;
    };

    // listener for game finished
    window.addEventListener('single-player-finished', gameCloseListener, false);
    onUnmounted(() => window.removeEventListener('single-player-finished', gameCloseListener));

    return {
      started,
      startGame,
      userData,
    };
  },
})
export default class SinglePlayer extends Vue {}
</script>
