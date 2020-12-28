<template>
  <div class="flex flex-col items-center">
    <div class="flex justify-center mb-2" v-if="showAbilities">
      <Control
        ref="q"
        class="mr-3"
        :value="81"
        @keydown="$emit('keydown', $event)"
        >Q</Control
      >
      <Control
        ref="w"
        class="mr-3"
        :value="87"
        @keydown="$emit('keydown', $event)"
        >W</Control
      >
      <Control
        ref="e"
        :value="69"
        class="mr-3"
        @keydown="$emit('keydown', $event)"
        >E</Control
      >
      <Control ref="r" :value="83" @keydown="$emit('keydown', $event)"
        >R</Control
      >
    </div>
    <div class="flex justify-center mb-2 md:hidden" v-if="showKeys">
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
      <Control
        ref="space"
        :value="32"
        @keydown="$emit('keydown', $event)"
      >
        <font-awesome-icon class="text-lg" icon="angle-double-down" />
      </Control>
    </div>
    <div class="flex justify-center mb-2 md:hidden" v-if="showKeys">
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
      <Control
        ref="right"
        :value="39"
        @keydown="$emit('keydown', $event)"
      >
        <font-awesome-icon class="text-lg" icon="arrow-right" />
      </Control>
    </div>
  </div>
</template>

<script lang="ts">
import { GameStateChange } from '@battletris/shared/functions/gameHelper';
import { onBeforeUnmount, ref } from '@vue/composition-api';
import { Component, Vue } from 'vue-property-decorator';
import Control from './Control.vue';

@Component({
  components: {
    Control,
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

    const keyDownListener = ($event: KeyboardEvent) => {
      if (references[$event.keyCode]) {
        references[$event.keyCode].value.mouseDown();
        $event.stopPropagation();
        return false;
      }
    };

    const keyUpListener = ($event: KeyboardEvent) => {
      if (references[$event.keyCode]) {
        references[$event.keyCode].value.mouseUp();
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
