<template>
  <div class="flex items-center justify-center class-container">
    <div
      class="cursor-pointer class-entry"
      v-for="(className, index) in classes"
      :class="[`step-${index}`, className === value ? 'active' : '']"
      :key="className"
      @click="$emit('input', className)"
    >
      <ClassLogo :value="className" />
      <h1 class="text-center">{{ $t(`classes.${className}.title`) }}</h1>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import ClassLogo from './ClassLogo.vue';

@Component({
  components: {
    ClassLogo,
  },
  props: {
    value: { type: String },
  },
  setup() {
    const classes = ['rouge', 'sorcerer', 'unknown', 'warlord', 'wizard'];

    return {
      classes,
    };
  },
})
export default class ClassGallery extends Vue {}
</script>

<style lang="postcss">
.class-container {
  min-height: 450px;
}

.class-entry {
  img {
    height: 200px;
    transition: 0.5s ease-out height, opacity;
    opacity: 0.5;
  }
  &.active {
    img {

      opacity: 1;
      height: 400px;
    }
  }
}
</style>
