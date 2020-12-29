<template>
  <div
    class="control-square"
    @mousedown="mouseDown(true)"
    @mouseup="mouseUp()"
    :class="{ active: isActive }"
  >
    <div class="text-lg font-bold">
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import { ref } from '@vue/composition-api';
import { Component, Vue } from 'vue-property-decorator';

@Component({
  props: {
    value: {},
  },
  setup(props, root) {
    const isActive = ref<boolean>(false);
    let pressedInterval: any;

    const mouseDown = (touch = false) => {
      isActive.value = true;
      root.emit('keydown', props.value);
      if (touch) {
        // trigger keydown event every 50ms, if the user holds the key
        pressedInterval = setInterval(() => root.emit('keydown', props.value), 100);
      }
    };

    const mouseUp = () => {
      isActive.value = false;
      root.emit('keyup', props.value);
      // clear pressed interval
      clearInterval(pressedInterval);
    };

    return {
      isActive,
      mouseDown,
      mouseUp,
    };
  },
})
export default class Controls extends Vue {}
</script>

<style lang="postcss">
.control-square {
  @apply border text-center flex justify-center items-center;

  background-color: var(--bg-1);
  border: 1px solid var(--bg-2);
  position: relative;
  height: 80px;
  width: 80px;
  -webkit-user-select: none; /* Safari */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* IE10+/Edge */
  user-select: none; /* Standard */

  &:hover {
    background-color: var(--bg-2);
    border: 1px solid var(--bg-1);
  }

  &.active {
    background-color: var(--bg-3);
    color: var(--bg-1);
  }

  @media (min-width: 760px) {
    width: 50px;
    height: 50px;
  }
}

.control-square.medium {
  @media (min-width: 760px) {
    width: 70px;
    height: 70px;
  }
}
</style>
