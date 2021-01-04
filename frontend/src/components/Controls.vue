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
    <div class="flex justify-center mt-2 md:hidden" v-if="showKeys">
      <Control
        ref="tab"
        class="mr-3"
        :value="9"
        @keydown="$emit('keydown', $event)"
      >
        <font-awesome-icon class="text-lg" icon="crosshairs" />
      </Control>
      <Control
        ref="up"
        class="mr-3"
        :value="38"
        @keydown="$emit('keydown', $event)"
      >
        <font-awesome-icon class="text-lg" icon="arrow-up" />
      </Control>
      <Control ref="space" :value="32" @keydown="$emit('keydown', $event)">
        <font-awesome-icon class="text-lg" icon="angle-double-down" />
      </Control>
    </div>
    <div class="flex justify-center mt-2 md:hidden" v-if="showKeys">
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
    </div>
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
    // direction keys keys
    const up = ref();
    const down = ref();
    const left = ref();
    const right = ref();
    const space = ref();
    const tab = ref();

    const references = {
      [GameStateChange.Q]: q,
      [GameStateChange.W]: w,
      [GameStateChange.E]: e,
      [GameStateChange.R]: r,
      [GameStateChange.TURN]: up,
      [GameStateChange.DOWN]: down,
      [GameStateChange.LEFT]: left,
      [GameStateChange.RIGHT]: right,
      [GameStateChange.FALL_DOWN]: space,
      [GameStateChange.NEXT_TARGET]: tab,
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
      q,
      w,
      e,
      r,
      up,
      down,
      left,
      right,
      space,
      tab,
    };
  },
})
export default class Controls extends Vue {}
</script>
