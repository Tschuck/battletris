<template>
  <div class="flex flex-col items-center">
    <div class="flex justify-center" v-if="showAbilities">
      <AbilityControl
        ref="q"
        class="mr-3 medium tooltip-box"
        :className="className"
        :abilityIndex="0"
        :keyValue="81"
        :userMana="userMana"
        keyText="Q"
        @keydown="$emit('keydown', $event)"
      />
      <AbilityControl
        ref="w"
        class="mr-3 medium tooltip-box"
        :className="className"
        :abilityIndex="1"
        :keyValue="87"
        :userMana="userMana"
        keyText="W"
        @keydown="$emit('keydown', $event)"
      />
      <AbilityControl
        ref="e"
        class="mr-3 medium tooltip-box"
        :className="className"
        :abilityIndex="2"
        :keyValue="69"
        :userMana="userMana"
        keyText="E"
        @keydown="$emit('keydown', $event)"
      />
      <AbilityControl
        ref="r"
        class="mr-3 medium tooltip-box"
        :className="className"
        :abilityIndex="3"
        :keyValue="82"
        :userMana="userMana"
        keyText="R"
        @keydown="$emit('keydown', $event)"
      />
    </div>
    <template v-if="showKeys">
      <div class="flex justify-center mt-2 md:hidden">
        <Control
          ref="targetUser1"
          class="mr-3"
          :value="49"
          @keydown="$emit('keydown', $event)"
        >
          <div class="text-xs font-bold">1</div>
        </Control>
        <Control
          ref="targetUser2"
          class="mr-3"
          :value="50"
          @keydown="$emit('keydown', $event)"
        >
          <div class="text-xs font-bold">2</div>
        </Control>
        <Control
          ref="targetUser3"
          class="mr-3"
          :value="51"
          @keydown="$emit('keydown', $event)"
        >
          <div class="text-xs font-bold">3</div>
        </Control>
        <Control
          ref="targetUser4"
          class="mr-3"
          :value="52"
          @keydown="$emit('keydown', $event)"
        >
          <div class="text-xs font-bold">4</div>
        </Control>
        <Control
          ref="targetUser5"
          class="mr-3"
          :value="53"
          @keydown="$emit('keydown', $event)"
        >
          <div class="text-xs font-bold">5</div>
        </Control>
      </div>
      <div class="flex justify-center mt-2 md:hidden">
        <Control
          ref="turnLeft"
          class="mr-3"
          :value="65"
          @keydown="$emit('keydown', $event)"
        >
          <font-awesome-icon class="text-lg" icon="undo" />
        </Control>
        <Control
          ref="up"
          class="hidden mr-3"
          :value="38"
          @keydown="$emit('keydown', $event)"
        >
          <font-awesome-icon class="text-lg" icon="arrow-up" />
        </Control>
        <Control
          ref="turnRight"
          class="mr-3"
          :value="68"
          @keydown="$emit('keydown', $event)"
        >
          <font-awesome-icon class="text-lg" icon="redo" />
        </Control>
      </div>
      <div class="flex justify-center mt-2 md:hidden">
        <Control
          ref="tab"
          class="mr-3"
          :value="9"
          @keydown="$emit('keydown', $event)"
        >
          <font-awesome-icon class="text-lg" icon="crosshairs" />
        </Control>
        <Control
          ref="left"
          class="mr-3"
          :value="37"
          @keydown="$emit('keydown', $event)"
        >
          <font-awesome-icon class="text-lg" icon="arrow-left" />
        </Control>
        <Control
          ref="down"
          class="mr-3"
          :value="40"
          @keydown="$emit('keydown', $event)"
        >
          <font-awesome-icon class="text-lg" icon="arrow-down" />
        </Control>
        <Control ref="right" :value="39" @keydown="$emit('keydown', $event)">
          <font-awesome-icon class="text-lg" icon="arrow-right" />
        </Control>
        <Control ref="space" :value="32" @keydown="$emit('keydown', $event)">
          <font-awesome-icon class="text-lg" icon="angle-double-down" />
        </Control>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { GameStateChange } from '@battletris/shared/functions/gameHelper';
import { onBeforeUnmount, ref } from '@vue/composition-api';
import { Component, Vue } from 'vue-property-decorator';
import { Key } from 'ts-keycode-enum';
import Control from './Control.vue';
import AbilityLogo from '../icons/AbilityLogo.vue';
import Tooltip from './Tooltip.vue';
import AbilityTooltip from './AbilityTooltip.vue';
import AbilityControl from './AbilityControl.vue';

const keysToIgnore = [
  Key.Alt,
  Key.Ctrl,
  Key.LeftWindowKey,
  Key.RightWindowKey,
  Key.Shift,
];

@Component({
  components: {
    AbilityControl,
    AbilityLogo,
    AbilityTooltip,
    Control,
    Tooltip,
  },
  props: {
    showAbilities: {
      type: Boolean,
      default: true,
    },
    showKeys: {
      type: Boolean,
      default: true,
    },
    className: {
      type: String,
    },
    userMana: {
      type: Number,
    },
  },
  setup() {
    // ability keys
    const q = ref();
    const w = ref();
    const e = ref();
    const r = ref();
    // direction keys
    const up = ref();
    const turnLeft = ref();
    const turnRight = ref();
    const down = ref();
    const left = ref();
    const right = ref();
    // game keys
    const space = ref();
    // target keys
    const tab = ref();
    const targetUser1 = ref();
    const targetUser2 = ref();
    const targetUser3 = ref();
    const targetUser4 = ref();
    const targetUser5 = ref();

    const references = {
      // ability keys
      [GameStateChange.Q]: q,
      [GameStateChange.W]: w,
      [GameStateChange.E]: e,
      [GameStateChange.R]: r,
      // direction keys
      [GameStateChange.TURN]: up,
      [GameStateChange.DOWN]: down,
      [GameStateChange.LEFT]: left,
      [GameStateChange.RIGHT]: right,
      [GameStateChange.TURN_LEFT]: turnLeft,
      [GameStateChange.TURN_RIGHT]: turnRight,
      // game keys
      [GameStateChange.FALL_DOWN]: space,
      // target keys
      [GameStateChange.NEXT_TARGET]: tab,
      [GameStateChange.TARGET_USER_1]: targetUser1,
      [GameStateChange.TARGET_USER_2]: targetUser2,
      [GameStateChange.TARGET_USER_3]: targetUser3,
      [GameStateChange.TARGET_USER_4]: targetUser4,
      [GameStateChange.TARGET_USER_5]: targetUser5,
    };

    const ignoreKeys: number[] = [];
    const keyDownListener = ($event: KeyboardEvent) => {
      if (ignoreKeys.indexOf($event.keyCode) === -1
        && keysToIgnore.indexOf($event.keyCode) !== -1) {
        ignoreKeys.push($event.keyCode);
      }
      // only react on known and single key presses, when command is pressed
      if (references[$event.keyCode] && ignoreKeys.length === 0) {
        references[$event.keyCode].value.mouseDown();
        $event.preventDefault();
        $event.stopPropagation();
        return false;
      }
    };

    const keyUpListener = ($event: KeyboardEvent) => {
      // clear pressed key stack
      ignoreKeys.splice(ignoreKeys.indexOf($event.keyCode), 1);
      if (references[$event.keyCode]) {
        references[$event.keyCode].value.mouseUp();
        $event.preventDefault();
        $event.stopPropagation();
        return false;
      }
    };

    window.addEventListener('keydown', keyDownListener);
    window.addEventListener('keyup', keyUpListener);

    onBeforeUnmount(() => {
      window.removeEventListener('keydown', keyDownListener);
      window.removeEventListener('keyup', keyUpListener);
    });

    return {
      down,
      e,
      left,
      q,
      r,
      right,
      space,
      tab,
      targetUser1,
      targetUser2,
      targetUser3,
      targetUser4,
      targetUser5,
      turnLeft,
      turnRight,
      up,
      w,
    };
  },
})
export default class Controls extends Vue {}
</script>
