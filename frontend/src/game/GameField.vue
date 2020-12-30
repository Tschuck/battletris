<template>
  <div
    style="width: 100%; height: 100%"
    class="flex flex-col bg-2 game-field"
    :id="`game-field-${userIndex}`"
  >
    <div class="flex justify-center flex-grow p-5">
      <div
        ref="container"
        class="relative flex justify-center flex-grow padding"
      ></div>
    </div>

    <div class="p-5">
      <div
        class="flex p-3 mb-3 overflow-x-auto"
        style="border: 2px solid var(--bg-1); min-height: 52px"
        :class="{
          'md:hidden': offline,
        }"
      >
        <div class="flex flex-row w-1/2 px-4 py-1 mr-1 bg-1 tooltip-box">
          <div class="flex" v-for="(block, i1) in nextBlocks" :key="i1">
            <div class="flex flex-col" v-for="(y, i2) in block" :key="i2">
              <div
                class="w-2 h-2"
                v-for="(x, i3) in y"
                :key="i3"
                :style="`margin-right: 1px; margin-top: 1px; background-color: ${
                  blockColors[y[x] || 0]
                }`"
              ></div>
            </div>
          </div>
          <Tooltip
            class="bg-1"
            :value="$t('game.next-blocks')"
            style="width: 200px"
          />
        </div>
        <Effect
          class="mr-1"
          v-for="effect of effects"
          :key="`${effect[0]}${effect[1]}${effect[2]}`"
          :classIndex="effect[0]"
          :abilityIndex="effect[1]"
          :ticked="effect[4]"
          :userId="userId"
        />
      </div>

      <div
        class="p-3"
        style="border: 2px solid var(--bg-1)"
        :class="{
          'md:hidden': offline,
        }"
      >
        <div class="flex items-center justify-between p-3 mb-1 bg-1">
          <span class="tooltip-box">
            <font-awesome-icon class="text-lg" icon="th-large" />
            {{ blockCount }}
            <Tooltip
              class="bg-1"
              :value="$t('classes.block-count-tooltip')"
              style="width: 200px"
            />
          </span>
          <span class="ml-3 tooltip-box">
            <font-awesome-icon class="text-lg" icon="chart-line" />
            {{ rowCount }}
            <Tooltip
              class="bg-1"
              :value="$t('classes.row-count-tooltip')"
              style="width: 200px"
            />
          </span>
          <span class="ml-3 tooltip-box">
            <font-awesome-icon class="text-lg" icon="angle-double-down" />
            {{ speed }}
            <Tooltip
              class="bg-1"
              :value="$t('classes.speed-tooltip')"
              style="width: 200px"
            />
          </span>
        </div>

        <div class="relative p-3 mb-1 text-center bg-1 tooltip-box">
          <span class="absolute top-0 left-0 right-0 z-20"
            >{{ armor }} / {{ classArmor }}</span
          >
          <div
            class="bg-red-600 animated-bar"
            :style="`width: ${(100 / classArmor) * armor}%`"
          />
          <Tooltip :value="$t('classes.armor')" />
        </div>

        <div class="relative p-3 mb-3 text-center bg-1 tooltip-box">
          <span class="absolute top-0 left-0 right-0 z-20"
            >{{ mana }} / {{ classMana }}</span
          >
          <div
            class="bg-blue-600 animated-bar"
            :style="`width: ${(100 / classMana) * mana}%`"
          />
          <Tooltip :value="$t('classes.mana')" />
        </div>
        <Controls
          @keydown="onKeyDown($event)"
          :className="className"
          :showAbilities="!offline"
          :userMana="mana"
          v-if="isCurrUser"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { onUnmounted, onMounted, ref } from '@vue/composition-api';
import { Component, Vue } from 'vue-property-decorator';

import { classes } from '@battletris/shared/functions/classes';
import { GameUser, Blocks } from '@battletris/shared';
import AbilityLogo from '../icons/AbilityLogo.vue';
import Controls from '../components/Controls.vue';
import currUser from '../lib/User';
import Effect from '../components/Effect.vue';
import FrontendGameUser from './GameUser';
import GameRenderer, { colorMap } from './GameRenderer';
import SingeGameUser from './SingleGameUser';
import Tooltip from '../components/Tooltip.vue';

interface GameFieldProps {
  userData: GameUser;
  userIndex: number;
}

@Component({
  components: {
    AbilityLogo,
    Controls,
    Effect,
    Tooltip,
  },
  props: {
    // total amount of playing users
    gameUserCount: { type: Number },
    // initial user data
    userData: {},
    // displayed users game index
    userIndex: { type: Number },
    // index of the currUser in the game
    activeUserIndex: { type: Number },
    // are we playing alone? (disable abilities and stuff)
    offline: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const { userData, userIndex } = (props as unknown) as GameFieldProps;

    // vue param setup
    const isCurrUser = ref<boolean>(currUser.id === userData.id);
    const container = ref();
    const userId = ref(userData.id);
    const className = ref(userData.className);
    const classArmor = ref(classes[userData.className].maxArmor);
    const classMana = ref(classes[userData.className].maxMana);
    const blockColors = ref(colorMap.STONES);
    // stat values
    const blockCount = ref<number>();
    const rowCount = ref<number>();
    const speed = ref<number>();
    const armor = ref<number>();
    const mana = ref<number>();
    const target = ref<number>();
    const effects = ref<number[][]>([]);
    const nextBlocks = ref<number[][][]>();
    const nextBlocksToRender = 3;

    /**
     * if this is the handler of the activly playing user, we can handle the active target focus
     * quite hacky to do it here, but all other ways are strange
     *   - in Game.vue we need to handle all users and format them again
     *   - event handlers are complexer than this
     */
    const updateTargetRendering = (newTargetIndex: number) => {
      target.value = newTargetIndex;

      // use direct css class accessor, vue will renrender the field and will cause flickering
      const gameField = document.getElementById(`game-field-${userIndex}`);
      gameField?.classList.remove('is-targeting');
      gameField?.classList.remove('is-self-targeting');
      if (target.value === props.activeUserIndex) {
        gameField?.classList.add(
          !isCurrUser.value ? 'is-targeting' : 'is-self-targeting'
        );
      }

      if (isCurrUser.value) {
        // remove targeted active game fields
        const previousTargeted = Array.from(
          document.getElementsByClassName('targeted-game-field'),
        );
        previousTargeted.forEach((el) => el.classList.remove('targeted-game-field'));
        // select the new target and add the targeted game field
        const newTarget = document.getElementById(`game-field-${target.value}`);
        newTarget?.classList.add('targeted-game-field');
      }
    };

    const updateNextBlocks = (user: SingeGameUser | FrontendGameUser) => {
      if (!user?.nextBlocks) {
        return;
      }

      nextBlocks.value = user.nextBlocks
        .slice(0, nextBlocksToRender)
        .map((blockId: number) => Blocks[blockId][0]);
      console.log(nextBlocks.value);
    };

    // will be initialized after on mounted
    let gameRenderer: GameRenderer;
    const UserClass = props.offline ? SingeGameUser : FrontendGameUser;
    const gameUser = new UserClass(
      userData,
      userIndex,
      props.gameUserCount as number,
      (user) => {
        armor.value = user.armor;
        blockCount.value = user.blockCount;
        effects.value = user.effects;
        mana.value = user.mana;
        rowCount.value = user.rowCount;
        speed.value = user.speed;
        // update target hints
        if (user.target !== target.value) {
          updateTargetRendering(user.target);
        }
        // rerender next blocks
        if (user.nextBlocks) {
          updateNextBlocks(gameUser);
        }
      },
    );

    const onKeyDown = (keyCode: number) => {
      gameUser.userKeyEvent(keyCode);
    };

    onMounted(() => {
      gameRenderer = new GameRenderer(container.value, gameUser, {
        animation: true,
        preview: true,
      });
      // ensure initial rendered target
      updateTargetRendering(target.value as number);
      updateNextBlocks(gameUser);
    });

    // be sure to stop watching, when game was left
    onUnmounted(() => {
      gameRenderer.destroy();
      gameUser.stop();
    });

    return {
      armor,
      blockColors,
      blockCount,
      classArmor,
      classMana,
      className,
      container,
      effects,
      isCurrUser,
      mana,
      nextBlocks,
      onKeyDown,
      rowCount,
      speed,
      target,
      userId,
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

.game-field {
  border-width: 5px;
  border-style: solid;
  border-color: var(--bg-1);
}

.targeted-game-field {
  @apply border-yellow-600 border-opacity-50;
}

.is-targeting {
  @apply border-red-600 border-opacity-50;
}

.is-self-targeting {
  @apply border-green-600 border-opacity-50;
}

.animated-bar {
  @apply absolute top-0 left-0 z-10 h-full bg-opacity-50;
  transition: 0.5s ease-out width;
}
</style>
