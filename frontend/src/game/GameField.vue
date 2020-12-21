<template>
  <div style="width: 100%; height: 100%;" class="flex flex-col p-3 bg-2">
    <div ref="container" class="flex-grow" />

    <div>
      <div>blockCount: {{blockCount}}</div>
      <div>rowCount: {{rowCount}}</div>
      <div>speed: {{speed}}</div>

      <div v-if="isCurrUser">
        <div>latency: ~{{latency}}ms</div>
      </div>

      <countdown :interval="100" :time="nextBlockMove">
        <template slot-scope="props">next down move: {{ props.milliseconds }}</template>
      </countdown>
    </div>
  </div>
</template>

<script lang="ts">
import {
  onUnmounted, onMounted, ref,
} from '@vue/composition-api';
import { Component, Vue } from 'vue-property-decorator';

import { GameUser } from '@battletris/shared';
import FrontendGameUser from './GameUser';
import SingeGameUser from './SingleGameUser';
import GameRenderer from './GameRenderer';

interface GameFieldProps {
  userData: GameUser;
  userIndex: number;
}

@Component({
  props: {
    userData: { },
    userIndex: { type: Number },
    offline: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const { userData, userIndex } = props as unknown as GameFieldProps;

    // vue param setup
    const isCurrUser = ref<boolean>(false);
    const container = ref();
    // stat values
    const blockCount = ref<number>();
    const rowCount = ref<number>();
    const speed = ref<number>();
    const nextBlockMove = ref<number>();
    const latency = ref<number>();

    // will be initialized after on mounted
    let gameRenderer: GameRenderer;
    const UserClass = props.offline ? SingeGameUser : FrontendGameUser;
    const gameUser = new UserClass(
      userData,
      userIndex,
      (user) => {
        blockCount.value = user.blockCount;
        rowCount.value = user.rowCount;
        speed.value = user.speed;
        nextBlockMove.value = user.nextBlockMove;
        latency.value = user.latency;
      },
    );

    onMounted(() => {
      gameRenderer = new GameRenderer(
        container.value,
        gameUser,
        {
          animation: true,
          preview: true,
        },
      );
    });

    // be sure to stop watching, when game was left
    onUnmounted(() => {
      gameRenderer.destroy();
      gameUser.stop();
    });

    return {
      blockCount,
      container,
      isCurrUser,
      latency,
      nextBlockMove,
      rowCount,
      speed,
    };
  },
})
export default class Game extends Vue {}
</script>

<style lang="postcss">
  svg {
    background-color: (--bg-2);
  }

  canvas {
    border: 3px solid var(--bg-1) !important;
    margin: auto !important;
    left: 0;
    right: 0;
  }
</style>
