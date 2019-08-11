<template>
  <div>
    <template v-if="$store.state.classes[className] && $store.state.classes[className].length !== 0">
      <template v-if="!battleUser">
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
      <template v-else>
        <div class="d-flex pt-3 px-3 justify-content-between">
          <div class="text-center border align-items-center position-relative pt-4 pb-3"
            style="height: 80px; width: 80px;"
            v-for="(ability, index) of $store.state.classes[className]"
            :class="{
              'active-ability': index === battleUser.abilityIndex
            }">
            <battletris-ability-img
              :className="className"
              :abilityIndex="index"
              :width="'25px'"
              :height="'25px'"
              :color="'var(--battletris-class-ability-color)'">
            </battletris-ability-img>
            <small class="d-block mt-1 mb-0">
              {{ `classes.${ className }.ability${ index }.title` | translate }}
            </small>
            <small class="ability-activator"
              v-b-tooltip.hover
              :title="$t(`classes.ability-activator`)">
              {{ [ 'q', 'w', 'e', 'r' ][index] }}
            </small>
            <small class="ability-costs"
              v-b-tooltip.hover
              :title="$t(`classes.ability-costs`)">
              {{ ability.config.costs }}
            </small>
          </div>
        </div>
        <span class="text-left mt-1" style="font-size: 15px;">
          {{ `classes.${ className }.ability${ battleUser.abilityIndex }.desc` | translate }}
        </span>
      </template>
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