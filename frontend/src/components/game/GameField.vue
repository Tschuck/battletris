<template>
  <div style="width: 100%; height: 100%;" class="flex flex-col">
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
  onUnmounted, onMounted, ref, computed,
} from '@vue/composition-api';
import { Component, Vue } from 'vue-property-decorator';

import { GameUser } from '@battletris/shared';
import ClassLogo from '../general/ClassLogo.vue';
import FrontendGameUser from './GameUser';
import GameRenderer from './GameRenderer';

interface GameFieldProps {
  roomId: string;
  userData: GameUser;
  userId: string;
  userIndex: number;
}

@Component({
  components: {
    ClassLogo,
  },
  props: {
    roomId: { type: String },
    userData: { },
    userId: { type: String },
    userIndex: { type: Number },
  },
  setup(props) {
    const {
      userData, userId, userIndex,
    } = props as unknown as GameFieldProps;

    // will be initialized after on mounted
    let gameRenderer: GameRenderer;
    const gameUser = new FrontendGameUser(
      { id: userId, className: userData.className },
      userIndex,
      { userSpeed: userData.speed },
    );

    // vue param setup
    const isCurrUser = ref<boolean>(gameUser.isCurrUser);
    const userElId = ref((userId).replace(/-/g, ''));
    const container = ref();
    // stat values
    const blockCount = computed(() => gameUser.blockCount);
    const rowCount = computed(() => gameUser.rowCount);
    const speed = computed(() => gameUser.speed);
    const nextBlockMove = computed(() => gameUser.nextBlockMove);
    const latency = computed(() => gameUser.latency);

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
      userElId,
    };
  },
})
export default class Game extends Vue {}
</script>
