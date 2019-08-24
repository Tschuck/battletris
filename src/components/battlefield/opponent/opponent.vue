<template>
  <div class="col-4 p-1 opponent"
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
          <small>
            <small
              v-b-tooltip.hover
              :title="'battle.user-name' | translate">
              {{ roomDetails.users[userId].name }}
            </small>

            <small
              v-b-tooltip.hover
              :title="$t('battle.rows')">
              ({{ battle.users[userId].rows }})
            </small>
          </small>
          <small
            v-b-tooltip.hover
            :title="'battle.user-status.title' | translate">
            {{ `battle.user-status.${ battle.users[userId].status }` | translate }}
          </small>
        </div>
        <div class="card-body p-0 d-flex flex-column">
          <div class="px-3 py-2" style="flex: 1;">
            <battletris-map
              @init="map = $event; initialized();">
            </battletris-map>
          </div>
          <battletris-battle-user-info
            style="min-height: 75px;"
            :battle="battle"
            :roomDetails="roomDetails"
            :userId="userId"
            :minimize="true">
          </battletris-battle-user-info>
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
