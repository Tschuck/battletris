<template>
  <div class="d-flex" v-if="battle && user">
    <div>
      <div>
        {{ 'battle.status' | translate }}:
        {{ `battle.user-status.${ battle.users[user.connectionId].status }` | translate }}
      </div>
      <div>
        {{ 'battle.rows' | translate }}:
        {{ user.rows }}
      </div>
      <div>
        {{ 'battle.mana' | translate }}:
        {{ user.mana }}
      </div>
    </div>
    <div>
      <div  class="d-flex"
        v-for="(row, rowIndex) in user.nextBlock">
        <div v-for="(col, colIndex) in user.nextBlock[rowIndex]"
          style="width: 20px; height: 20px;"
          :style="{
            'background-color': user.nextBlock[rowIndex][colIndex] ? `var(--battletris-block-bg-${ user.nextBlock.type })` : 'transparent',
            'border': `1px solid var(battletris-block-border)`,
          }">
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import Component from './status';
  export default Component;
</script>
