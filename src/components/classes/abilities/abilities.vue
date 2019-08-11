<template>
  <div class="d-flex justify-content-between">
    <template v-if="$store.state.classes[className].length !== 0">
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
    </template>
    <div class="border p-3" v-else>
      <small>{{ 'classes.in-development' | translate }}</small>
    </div>
  </div>
</template>

<script>
  import Component from './abilities';
  export default Component;
</script>
