<template>
  <div
    class="control-square"
    @mousedown="mouseDown(value)"
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

    const mouseDown = () => {
      isActive.value = true;
      root.emit('keydown', props.value);
    };

    const mouseUp = () => {
      isActive.value = false;
      root.emit('keyup', props.value);
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
.control,
.control-square {
  @apply border text-center flex justify-center items-center;

  background-color: var(--bg-1);
  border: 1px sloid var(--bg-2);
  height: 40px;
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
}

.control-square {
  width: 40px;
}
</style>
