<template>
  <div class="tooltip">
    <span class="triangle"></span>
    <slot>
      <span class="text-gray-300">{{ $t(value) }}</span>
    </slot>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({
  props: {
    value: { type: String },
  },
})
export default class RootNav extends Vue {}
</script>

<style lang="postcss">
.tooltip-box {
  position: relative;

  &:hover {
    .tooltip {
      display: block;
    }
  }
}

.tooltip {
  background-color: var(--bg-2);
  text-align: center;
  padding: 5px 20px;
  bottom: calc(100% + 11px);
  left: 50%;
  transform: translate(-50%);
  position: absolute;
  display: none;
  z-index: 30;

  &.bg-1 {
    background-color: var(--bg-1);
  }

  @apply text-gray-300;
}

.triangle {
  border-width: 0 4.5px 6px;
  border-color: transparent;
  border-bottom-color: var(--bg-2);
  position: absolute;
  bottom: -6px;
  transform: rotate(180deg);
  left: calc(50% - 9px);
}
</style>
