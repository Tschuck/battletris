<template>
  <div class="battletris-controls">
    <div class="arrows">
      <div>
        <i class="mdi mdi-arrow-up"></i>
        <span>{{ 'battle.controls.turn' | translate }}</span>
      </div>
      <div>
        <i class="mdi mdi-arrow-left"></i>
        <span>{{ 'battle.controls.left' | translate }}</span>
      </div>
      <div>
        <i class="mdi mdi-arrow-down"></i>
        <span>{{ 'battle.controls.down' | translate }}</span>
      </div>
      <div>
        <i class="mdi mdi-arrow-right"></i>
        <span>{{ 'battle.controls.right' | translate }}</span>
      </div>
    </div>

    <div class="space">
      <span>{{ 'battle.controls.space' | translate }}</span>
      <span>{{ 'battle.controls.space-desc' | translate }}</span>
    </div>
  </div>
</template>

<script>
  import Component from './controls';
  export default Component;
</script>

<style lang="scss" scoped>
  @import './controls.scss'
</style>
