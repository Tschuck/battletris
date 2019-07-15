<template>
  <div class="d-flex" v-if="battle && user">
    <div class="d-flex">
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
      <div class="position-relative pl-5" style="width: 237px;">
        {{ 'battle.next-block' | translate }}:
        <div style="position: absolute; right: 0; top: -9px;">
          <div class="d-flex"
            v-for="(row, rowIndex) in user.nextBlock.map"
            v-if="user.nextBlock.map[rowIndex].filter((col) => col).length !== 0">
            <div v-for="(col, colIndex) in user.nextBlock.map[rowIndex]"
              style="width: 20px; height: 20px; border: 1px solid var(--battletris-block-border)"
              :style="{
                'background-color': col ? `var(--battletris-block-bg-${ user.nextBlock.type })` : 'transparent',
              }">
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import Component from './status';
  export default Component;
</script>
