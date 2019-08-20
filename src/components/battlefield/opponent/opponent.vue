<template>
  <div class="col-4 p-3 opponent"
    v-if="userId !== connectionId">
    <div class="card w-100 h-100"
      :class="{
        'active-card': battle.users[connectionId] && battle.users[connectionId].targetId === userId 
      }">
      <template v-if="userId && battle.users && battle.users[userId]">
        <div class="card-header position-relative">
          <div class="opponent-number"
            v-b-tooltip.hover
            :title="'battle.user-number' | translate">
            {{ Object.keys(battle.users).indexOf(userId) + 1 }}
          </div>
          <span
            v-b-tooltip.hover
            :title="'battle.user-name' | translate">
            {{ roomDetails.users[userId].name }}
          </span>
          <span class="mx-auto"></span>
          <span
            v-b-tooltip.hover
            :title="'battle.user-status.title' | translate">
            {{ `battle.user-status.${ battle.users[userId].status }` | translate }}
          </span>
        </div>
        <div class="card-body p-0 d-flex flex-column">
          <div class="d-flex">
            <battletris-mana-bar
              :mana="battle.users[userId].mana">
            </battletris-mana-bar>

            <span class="d-block pl-3 pr-1"
              style="font-size: 8px;"
              v-b-tooltip.hover
              :title="$t('battle.rows')">
              {{ battle.users[userId].rows }}
            </span>
          </div>
          <div class="px-3 py-2" style="flex: 1; height: calc(100% - 12px)">
            <battletris-map
              @init="map = $event; initialized();">
            </battletris-map>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
  import Component from './opponent';
  export default Component;
</script>

<style lang="scss" scoped>
  @import './opponent.scss'
</style>
