<template>
  <div class="d-flex">
    <div class="d-flex align-items-center flex-column justify-content-center border"
      :style="{
        'height': size,
        'width': size,
      }"
      v-for="(effect, index) in battleUser.effects"
      v-b-tooltip.hover
      :title="$t(`classes.${ effect.className }.ability${ effect.abilityIndex }.desc`)">
      <battletris-ability-img
        :className="effect.className"
        :abilityIndex="effect.abilityIndex"
        :width="'15px'"
        :height="'15px'"
        :color="'var(--battletris-class-ability-color)'">
      </battletris-ability-img>

      <!-- explicitly check for battleUser to force reactive cooldowns -->
      <small class="d-block"
        :style="{
          'font-size': minimize ? '5px': '10px'
        }">
        {{ Math.round(((effect.start + effect.duration) - dateNow) / 1000) }}s
      </small>
    </div>
  </div>
</template>

<script>
  import Component from './effects';
  export default Component;
</script>

<style lang="scss" scoped>
  @import './effects.scss'
</style>