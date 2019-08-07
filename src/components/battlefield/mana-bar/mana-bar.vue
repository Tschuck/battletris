<template>
  <div class="mana-bar"
    v-b-tooltip.hover
    :title="$t('battle.mana')">
    <div :style="{ width: `${ mana }%` }"></div>
    <small>{{ mana }} / 100</small>
  </div>
</template>

<script>
  import Component from './mana-bar';
  export default Component;
</script>

<style lang="scss" scoped>
  @import './mana-bar.scss'
</style>
