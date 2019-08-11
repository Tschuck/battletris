<template>
  <table class="w-100">
    <tr>
      <td><i class="mdi mdi-arrow-up"></i>:<td>
      <td class="text-right">{{ 'battle.controls.turn' | translate }}</td>
    </tr>
    <tr>
      <td><i class="mdi mdi-arrow-left"></i>:<td>
      <td class="text-right">{{ 'battle.controls.left' | translate }}</td>
    </tr>
    <tr>
      <td><i class="mdi mdi-arrow-down"></i>:<td>
      <td class="text-right">{{ 'battle.controls.down' | translate }}</td>
    </tr>
    <tr>
      <td><i class="mdi mdi-arrow-right"></i>:<td>
      <td class="text-right">{{ 'battle.controls.right' | translate }}</td>
    </tr>
    <tr>
      <td>{{ 'battle.controls.space' | translate }}:<td>
      <td class="text-right">{{ 'battle.controls.space-desc' | translate }}</td>
    </tr>
    <tr>
      <td>q, w, e, r:<td>
      <td class="text-right">{{ 'battle.controls.activate-ability' | translate }}</td>
    </tr>
    <tr>
      <td>1 - 6:<td>
      <td class="text-right">{{ 'battle.controls.use-ability' | translate }}</td>
    </tr>
    <tr>
      <td>{{ 'battle.controls.tab' | translate }}:<td>
      <td class="text-right">{{ 'battle.controls.use-ability-self' | translate }}</td>
    </tr>
  </table>
</template>

<script>
  import Component from './controls';
  export default Component;
</script>

<style lang="scss" scoped>
  @import './controls.scss'
</style>
