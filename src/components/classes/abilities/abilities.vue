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
                {{ 'classes.ability-costs' | translate }}: {{ ability.costs }}
              </small>
              <small class="mr-3"
                v-if="ability.cooldown">
                {{ 'classes.cooldown' | translate }}: {{ Math.round(ability.cooldown / 1000) }}s
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
            v-b-tooltip.hover
            :class="{
              'active-ability': index === battleUser.abilityIndex
            }"
            :style="{
              'opacity': battleUser.mana < ability.costs ? 0.5: 1,
            }"
            :title="$t(`classes.${ className }.ability${ battleUser.abilityIndex }.desc`)">
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
              {{ ability.costs }}
            </small>
            <!-- explicitly check for battleUser to force reactive cooldowns -->
            <div class="ability-cooldown"
              v-if="battleUser &&
                    battleUser.cooldowns[index] &&
                    battleUser.cooldowns[index] > dateNow">
              {{ Math.round((battleUser.cooldowns[index] - dateNow) / 1000) }}s
            </div>
          </div>
        </div>
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