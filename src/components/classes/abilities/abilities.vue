<template>
  <div>
    <template v-if="$store.state.classes[className] && $store.state.classes[className].length !== 0">
      <template v-if="descriptionMode">
        <div class="d-flex mt-3 align-items-center"
          v-for="(ability, index) of $store.state.classes[className]">
          <div class="p-1 text-center border">
            <battletris-ability-img
              :className="className"
              :abilityIndex="index"
              :width="'70px'"
              :height="'70px'"
              :color="'var(--battletris-class-ability-color)'">
            </battletris-ability-img>
          </div>
          <div class="px-3">
            <b class="d-block">
              {{ `classes.${ className }.ability${ index }.title` | translate }}
            </b>
            <span style="font-size: 15px;">
              {{ `classes.${ className }.ability${ index }.desc` | translate }}
            </span>
            <div class="d-flex font-italic" style="opacity: 0.5">
              <small class="mr-3">
                {{ 'classes.ability-costs' | translate }}: {{ ability.config.costs }}
              </small>
              <small class="mr-3"
                v-if="ability.config.cooldown">
                {{ 'classes.ability-costs' | translate }}: {{ ability.config.cooldown }}ms
              </small>
            </div>
          </div>
        </div>
      </template>
      <div v-else>
        <div class="p-3 text-center border"
          v-b-tooltip.hover
          :title="$t(`classes.${ className }.ability${ index }.desc`)">
          <battletris-ability-img
            :className="className"
            :abilityIndex="index"
            :width="descriptionMode ? '50px' : '20px'"
            :height="descriptionMode ? '50px' : '20px'"
            :color="'var(--battletris-class-ability-color)'">
          </battletris-ability-img>
          <small class="mt-1 mb-0"
            v-if="!descriptionMode">
            {{ `classes.${ className }.ability${ index }.title` | translate }}
          </small>
        </div>
      </div>
    </template>
    <div class="border m-3 p-3" v-else>
      <small>{{ 'classes.in-development' | translate }}</small>
    </div>
  </div>
</template>

<script>
  import Component from './abilities';
  export default Component;
</script>

<style lang="scss" scoped>
  @import './abilities.scss'
</style>