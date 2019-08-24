<template>
  <div class="battle-user-info" v-if="battle">
    <div class="d-flex">
      <div>
        <battletris-abilities
          class="mb-1"
          :className="roomDetails.users[userId].className"
          :battleUser="battle.users[userId]"
          :minimize="minimize">
        </battletris-abilities>
        <battletris-resource-bar
          :color="'var(--battletris-mana-bg)'"
          :resource="battle.users[userId].mana"
          :type="'mana'">
        </battletris-resource-bar>
      </div>
      <div class="text-center px-1" style="width: auto">
        <div class="d-flex"
          v-for="(row, rowIndex) in battle.users[userId].nextBlock.map"
          v-if="battle.users[userId].nextBlock.map[rowIndex].filter((col) => col).length !== 0"
          v-b-tooltip.hover
          :title="$t('battle.next-block')">
          <div v-for="(col, colIndex) in battle.users[userId].nextBlock.map[rowIndex]"
            style="border: 1px solid var(--battletris-block-border)"
            :style="{
              'background-color': col ? `var(--battletris-block-bg--2)` : 'transparent',
              'width': minimize ? '15px' : '20px',
              'height': minimize ? '15px' : '20px',
            }">
          </div>
        </div>
      </div>
      <div>
        <div class="opponent-preview mb-1">
          <small
            :style="{
              'background-color': userId === battle.users[userId].targetId ? 'var(--battletris-self-target)' : 'var(--battletris-armor-bg)'
            }">
            {{ Object.keys(battle.users).indexOf(battle.users[userId].targetId) + 1 }}
          </small>

          <span>|</span>

          <small
            v-for="(opponentId, index) in Object.keys(battle.users)"
            v-if="battle.users[opponentId].targetId === userId"
            :style="{
              'background-color': userId === opponentId ? 'var(--battletris-self-target)' : 'var(--battletris-armor-bg)'
            }">
            {{ Object.keys(battle.users).indexOf(userId) + 1 }}
          </small>
        </div>
        <battletris-resource-bar
          :color="'var(--battletris-armor-bg)'"
          :resource="battle.users[userId].armor"
          :type="'armor'">
        </battletris-resource-bar>
      </div>
    </div>
    <div class="effects-container mt-1">
      <battletris-effects
        :battleUser="battle.users[userId]"
        :minimize="minimize"
        :size="minimize ? '30px' : '40px'">
      </battletris-effects>
    </div>
  </div>
</template>

<script>
  import Component from './battle-user-info';
  export default Component;
</script>

<style lang="scss" scoped>
  @import './battle-user-info.scss'
</style>
