<template>
  <div>
    <div
      class="fixed left-0 right-0 z-20 p-5 mx-auto bg-1"
      style="max-width: 100%; width: 500px; top: 100px"
      v-if="show"
    >
      <slot />
    </div>

    <div
      class="fixed top-0 bottom-0 left-0 right-0 z-10 opacity-50 bg-2"
      v-if="show"
      @click="$emit('close')"
    />
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({
  props: {
    show: { type: Boolean },
  },
})
export default class Modal extends Vue {}
</script>
