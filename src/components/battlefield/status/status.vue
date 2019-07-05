<template>
  <div v-if="battle && user">
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
</template>

<script>
  import Component from './status';
  export default Component;
</script>
