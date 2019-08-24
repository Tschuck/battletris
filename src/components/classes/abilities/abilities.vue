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
        <div class="row m-0">
          <div class="col-3 m-0 p-0 text-center border position-relative"
            v-for="(ability, index) of $store.state.classes[className]"
            v-b-tooltip.hover
            :style="{
              'opacity': battleUser.mana < ability.costs ? 0.5: 1,
            }"
            :title="$t(`classes.${ className }.ability${ index }.desc`)">
            <battletris-ability-img
              :className="className"
              :abilityIndex="index"
              :width="minimize ? '15px': '20px'"
              :height="minimize ? '15px': '20px'"
              :color="'var(--battletris-class-ability-color)'">
            </battletris-ability-img>
            <small class="text-nowrap mana-costs"
              v-if="!minimize"
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