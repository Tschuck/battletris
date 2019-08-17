<template>
  <div v-if="battle && user">
    <div class="d-flex">
      <b>{{ 'battle.user-status.title' | translate }}:</b>
      <span class="mx-auto"></span>
      <div>
        {{ `battle.user-status.${ battle.users[user.connectionId].status }` | translate }}
      </div>
    </div>
    <div class="d-flex">
      <b>{{ 'battle.level' | translate }}:</b>
      <span class="mx-auto"></span>
      <div>
        {{ user.level }}
      </div>
    </div>
    <div class="d-flex">
      <b>{{ 'battle.rows' | translate }}:</b>
      <span class="mx-auto"></span>
      <div>
        {{ user.rows }}
      </div>
    </div>
    <div class="d-flex">
      <b>{{ 'battle.mana' | translate }}:</b>
      <span class="mx-auto"></span>
      <div>
        {{ user.mana }}
      </div>
    </div>
  </div>
</template>

<script>
  import Component from './status';
  export default Component;
</script>
