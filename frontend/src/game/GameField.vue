<template>
  <div
    style="width: 100%; height: 100%"
    class="flex flex-col bg-2 game-field"
    :id="`game-field-${userIndex}`"
    :class="{ 'opacity-50': hasLost }"
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
        <Effect
          class="mr-1"
          v-for="effect of effects"
          :key="`${effect[0]}${effect[1]}${effect[2]}`"
          :classIndex="effect[0]"
          :abilityIndex="effect[1]"
          :ticked="effect[4]"
          :stack="effect[5]"
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
            <font-awesome-icon class="text-lg" icon="user-circle" />
            {{ userIndex + 1 }}
            <Tooltip
              class="bg-1"
              :value="$t('classes.user-index')"
              style="width: 200px"
            />
          </span>
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
            <font-awesome-icon class="text-lg" icon="trophy" />
            {{ level }}
            <Tooltip
              class="bg-1"
              :value="$t('classes.level')"
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

        <div class="relative p-3 text-center bg-1 tooltip-box">
          <span class="absolute top-0 left-0 right-0 z-20"
            >{{ armor }} / {{ maxArmor }}</span
          >
          <div
            class="bg-red-600 animated-bar"
            :style="`width: ${(100 / maxArmor) * armor}%`"
          />
          <Tooltip :value="$t('classes.armor')" />
        </div>

        <div class="relative p-3 text-center bg-1 tooltip-box">
          <span class="absolute top-0 left-0 right-0 z-20"
            >{{ mana }} / {{ maxMana }}</span
          >
          <div
            class="bg-blue-600 animated-bar"
            :style="`width: ${(100 / maxMana) * mana}%`"
          />
          <Tooltip :value="$t('classes.mana')" />
        </div>

        <div class="relative p-3 mb-3 text-center bg-1 tooltip-box">
          <span class="absolute top-0 left-0 right-0 z-20"
            >{{ exp }} / {{ maxExp }}</span
          >
          <div
            class="bg-yellow-300 animated-bar"
            :style="`width: ${(100 / maxExp) * exp}%`"
          />
          <Tooltip :value="$t('classes.exp')" />
        </div>
        <Controls
          :className="className"
          :showAbilities="!offline"
          :userMana="mana"
          :cooldowns="cooldowns"
          v-if="isCurrUser"
        />
      </div>
    </div>
    <div
      class="flex flex-row items-center justify-between w-1/2 px-4 py-1 mr-1 hold-box leading-box bg-1"
      v-if="isCurrUser && hold && Blocks[hold]"
      :style="holdLock ? 'filter: grayscale(1); opacity: 0.7;' : ''"
    >
      <span class="mr-2">{{ $t("game.hold") }}</span>
      <div class="flex flex-col mr-1">
        <div class="flex flex-row" v-for="(y, i1) in Blocks[hold][0]" :key="i1">
          <template v-if="y.length && y.some((x) => x)">
            <div
              class="w-2 h-2"
              v-for="(x, i2) in y"
              :key="i2"
              :style="`margin-right: 1px; margin-top: 1px; background-color: ${
                blockColors[y[i2] || 0]
              }`"
            ></div>
          </template>
        </div>
      </div>
    </div>

    <div
      class="flex flex-row items-center justify-between w-1/2 px-4 py-1 mr-1 leading-box bg-1"
    >
      <template v-if="isCurrUser">
        <div
          class="flex flex-col mr-1"
          v-for="(block, i1) in nextBlocks"
          :key="i1"
        >
          <div class="flex flex-row" v-for="(y, i2) in block" :key="i2">
            <template v-if="y.length">
              <div
                class="w-2 h-2"
                v-for="(x, i3) in y"
                :key="i3"
                :style="`margin-right: 1px; margin-top: 1px; background-color: ${
                  blockColors[y[i3] || 0]
                }`"
              ></div>
            </template>
          </div>
        </div>
      </template>
      <template v-else>
        <ClassLogo class="w-6" :className="className" height="20px" />
        <span class="ml-3 text-xs font-bold w=full text-center">{{
          userName
        }}</span>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { onUnmounted, onMounted, ref } from '@vue/composition-api';
import { Component, Vue } from 'vue-property-decorator';

import { GameUser, Blocks } from '@battletris/shared';
import AbilityLogo from '../icons/AbilityLogo.vue';
import ClassLogo from '../icons/ClassLogo.vue';
import Controls from '../components/Controls.vue';
import KeyHandler from './KeyHandler';
import currUser from '../lib/User';
import Effect from '../components/Effect.vue';
import FrontendGameUser from './GameUser';
import GameRenderer, { colorMap } from './GameRenderer';
import Tooltip from '../components/Tooltip.vue';
import GameRegistry from './GameRegistry';

interface GameFieldProps {
  userData: GameUser;
  userIndex: number;
}

@Component({
  components: {
    AbilityLogo,
    ClassLogo,
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
    // list of lost users
    lostUsers: { type: [Number] },
  },
  setup(props) {
    const { userData, userIndex } = (props as unknown) as GameFieldProps;

    // vue param setup
    const isCurrUser = ref<boolean>(currUser.id === userData.id);
    const container = ref();
    const userId = ref(userData.id);
    const userName = ref(userData.name);
    const className = ref(userData.className);
    const maxArmor = ref(userData.maxArmor);
    const maxMana = ref(userData.maxMana);
    const maxExp = ref(userData.maxExp);
    const blockColors = ref(colorMap.STONES);
    // stat values
    const armor = ref<number>();
    const exp = ref<number>();
    const level = ref<number>();
    const blockCount = ref<number>();
    const cooldowns = ref<number[]>([]);
    const effects = ref<number[][]>([]);
    const hasLost = ref<boolean>();
    const mana = ref<number>();
    const nextBlocks = ref<number[][][]>();
    const nextBlocksToRender = 3;
    const rowCount = ref<number>();
    const speed = ref<number>();
    const hold = ref<number>();
    const holdLock = ref<boolean>(false);

    // non vue values
    let target = -1;

    /**
     * if this is the handler of the activly playing user, we can handle the active target focus
     * quite hacky to do it here, but all other ways are strange
     *   - in Game.vue we need to handle all users and format them again
     *   - event handlers are complexer than this
     */
    const updateTargetRendering = (newTargetIndex: number) => {
      target = newTargetIndex;

      // use direct css class accessor, vue will renrender the field and will cause flickering
      const gameField = document.getElementById(`game-field-${userIndex}`);
      gameField?.classList.remove('is-targeting');
      gameField?.classList.remove('is-self-targeting');
      if (target === props.activeUserIndex) {
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
        const newTarget = document.getElementById(`game-field-${target}`);
        newTarget?.classList.add('targeted-game-field');
      }
    };

    const updateNextBlocks = (user: FrontendGameUser) => {
      if (!user?.nextBlocks) {
        return;
      }

      nextBlocks.value = user.nextBlocks
        .slice(0, nextBlocksToRender)
        .map((blockId: number) => {
          // reduce empty block rows
          const block = [...Blocks[blockId][0]];
          return block.filter((y: number[]) => y.find((x: number) => !!x));
        });
    };

    const paramPropMapping = {
      armor,
      blockCount,
      effects,
      mana,
      rowCount,
      speed,
      cooldowns,
      maxArmor,
      maxMana,
      maxExp,
      exp,
      level,
      hold,
      holdLock,
      lost: hasLost,
    };

    // will be initialized after on mounted
    let gameRenderer: GameRenderer;
    let keyHandler: KeyHandler;
    const UserClass = FrontendGameUser;
    const gameUser = new UserClass(
      userData,
      userIndex,
      props.gameUserCount as number,
      (user) => {
        // only update when needed to reduce "flickering"
        Object.keys(paramPropMapping).forEach((prop) => {
          if (typeof user[prop] !== 'undefined') {
            paramPropMapping[prop].value = user[prop];
          }
        });

        // update target hints
        if (user.target !== target) {
          updateTargetRendering(user.target);
        }
        // rerender next blocks
        if (user.nextBlocks) {
          updateNextBlocks(user);
        }
      },
    );

    // register the game user in the game registry, so every game user class in the same room can
    // access this one
    GameRegistry[userIndex] = gameUser;

    // watch for user input, if the current user is participating the match
    if (isCurrUser.value) {
      keyHandler = new KeyHandler(currUser, gameUser);
      keyHandler.listen();
    }

    onMounted(() => {
      gameRenderer = new GameRenderer(container.value, gameUser, {
        animation: true,
        preview: true,
      });
      // ensure initial rendered target
      updateTargetRendering(target as number);
      updateNextBlocks(gameUser);
    });

    // be sure to stop watching, when game was left
    onUnmounted(() => {
      if (keyHandler) {
        keyHandler.stop();
      }
      gameRenderer.destroy();
      gameUser.stop();
    });

    return {
      armor,
      blockColors,
      blockCount,
      Blocks,
      className,
      container,
      cooldowns,
      effects,
      exp,
      hasLost,
      hold,
      holdLock,
      isCurrUser,
      level,
      mana,
      maxArmor,
      maxExp,
      maxMana,
      nextBlocks,
      rowCount,
      speed,
      target,
      userId,
      userName,
    };
  },
})
export default class Game extends Vue { }
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
  position: relative;
}

.targeted-game-field {
  &,
  &.is-targeting,
  .leading-box {
    @apply border-yellow-600 border-opacity-50;
  }
}

.is-targeting {
  &,
  .leading-box {
    @apply border-red-600 border-opacity-50;
  }
}

.is-self-targeting {
  &,
  .leading-box {
    @apply border-green-600 border-opacity-50;
  }
}

.animated-bar {
  @apply absolute top-0 left-0 z-10 h-full bg-opacity-50;
  transition: 0.5s ease-out width;
  max-width: 100%;
}

.leading-box {
  position: absolute;
  top: -19px;
  overflow: hidden;
  margin: auto;
  right: 10px;
  border-width: 5px;
  border-style: solid;
  border-color: var(--bg-1);
  min-height: 36px;
  max-height: 36px;
}

.hold-box {
  left: 10px;
  right: auto;
  min-height: 36px;
  width: 110px;
}
</style>
