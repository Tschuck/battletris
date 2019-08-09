<template>
  <div class="d-flex justify-content-between">
    <div class="p-3 text-center"
      v-for="(ability, index) of $store.state.classes[className]"
      v-b-tooltip.hover
      :title="$t(`classes.${ className }.ability${ index }.desc`)">
      <battletris-ability-img
        :className="className"
        :abilityIndex="index"
        :width="'30px'"
        :height="'30px'"
        :color="'var(--battletris-ability-icon-color)'">
      </battletris-ability-img>
      {{ `classes.${ className }.ability${ index }.title` | translate }}
    </div>
  </div>
</template>

<script>
  import Component from './abilities';
  export default Component;
</script>
