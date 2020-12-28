<template>
  <div style="width: 100%; height: 100%" class="flex flex-col bg-2">
    <div class="flex justify-center flex-grow p-5">
      <div
        ref="container"
        class="relative flex justify-center flex-grow padding"
      ></div>
    </div>

    <div class="p-5">
      <div
        class="p-3"
        style="border-top: 2px solid var(--bg-1)"
        :class="{
          'md:hidden': offline,
        }"
      >
        <div>mana: {{ mana }}</div>
        <div>armor: {{ armor }}</div>
        <div>blockCount: {{ blockCount }}</div>
        <div>rowCount: {{ rowCount }}</div>
        <div>speed: {{ speed }}</div>
        <div>effects: {{ effects }}</div>
        <div>effectsString: {{ effectsString }}</div>

        <div v-if="isCurrUser">
          <div>latency: ~{{ latency }}ms</div>
        </div>

        <countdown :interval="100" :time="nextBlockMove">
          <template slot-scope="props"
            >next down move: {{ props.milliseconds }}</template
          >
        </countdown>
        <Controls @keydown="onKeyDown($event)" :showAbilities="!offline" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { onUnmounted, onMounted, ref } from '@vue/composition-api';
import { Component, Vue } from 'vue-property-decorator';

import { GameUser } from '@battletris/shared';
import FrontendGameUser from './GameUser';
import SingeGameUser from './SingleGameUser';
import GameRenderer from './GameRenderer';
import Controls from '../components/Controls.vue';

interface GameFieldProps {
  userData: GameUser;
  userIndex: number;
}

@Component({
  components: {
    Controls,
  },
  props: {
    userData: {},
    userIndex: { type: Number },
    offline: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const { userData, userIndex } = (props as unknown) as GameFieldProps;

    // vue param setup
    const isCurrUser = ref<boolean>(false);
    const container = ref();
    // stat values
    const blockCount = ref<number>();
    const rowCount = ref<number>();
    const speed = ref<number>();
    const nextBlockMove = ref<number>();
    const latency = ref<number>();
    const armor = ref<number>();
    const mana = ref<number>();
    const effects = ref<number[][]>([]);
    const effectsString = ref<string>('');

    // will be initialized after on mounted
    let gameRenderer: GameRenderer;
    const UserClass = props.offline ? SingeGameUser : FrontendGameUser;
    const gameUser = new UserClass(userData, userIndex, (user) => {
      blockCount.value = user.blockCount;
      rowCount.value = user.rowCount;
      speed.value = user.speed;
      nextBlockMove.value = user.nextBlockMove;
      latency.value = user.latency;
      armor.value = user.armor;
      mana.value = user.mana;
      effects.value = user.effects;
      effectsString.value = JSON.stringify(user.effects);
    });

    const onKeyDown = (keyCode: number) => {
      gameUser.userKeyEvent(keyCode);
    };

    onMounted(() => {
      gameRenderer = new GameRenderer(container.value, gameUser, {
        animation: true,
        preview: true,
      });
    });

    // be sure to stop watching, when game was left
    onUnmounted(() => {
      gameRenderer.destroy();
      gameUser.stop();
    });

    return {
      armor,
      blockCount,
      container,
      effects,
      effectsString,
      isCurrUser,
      latency,
      mana,
      nextBlockMove,
      onKeyDown,
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

.konvajs-content {
  position: initial !important;
}
</style>
