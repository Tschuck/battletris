<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    :style="`height: ${height}; width: ${width}; margin: auto;`"
  >
    <slot />
  </svg>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

export const iconProps = {
  color: { type: String, default: '#e2e8f0' },
  width: { type: String, default: '100%' },
  height: { type: String, default: 'auto' },
};

@Component({
  props: {
    ...iconProps,
  },
})
export default class Icon extends Vue {}
</script>
