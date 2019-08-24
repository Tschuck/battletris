<template>
  <div class="battletris-map">
    <canvas ref="canvas">
    </canvas>
    <slot></slot>
  </div>
</template>

<script>
  import Component from './map';
  export default Component;
</script>

<style lang="scss" scoped>
  @import './map.scss'
</style>
