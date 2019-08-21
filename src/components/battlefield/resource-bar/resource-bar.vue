<template>
  <div class="resource-bar"
    v-b-tooltip.hover
    :title="`battle.${ type }` | translate">
    <div :style="{
      'width': `${ resource }%`,
      'background-color': color,
    }"></div>
    <small>{{ Math.round(resource) }} / 100</small>
  </div>
</template>

<script>
  import Component from './resource-bar';
  export default Component;
</script>

<style lang="scss" scoped>
  @import './resource-bar.scss'
</style>
