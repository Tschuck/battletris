<template>
  <img v-if="value === 'rouge'" class="logo-rouge" src="@/assets/classes/rouge.svg">
  <img v-else-if="value === 'sorcerer'" class="logo-sorcerer" src="@/assets/classes/sorcerer.svg">
  <img v-else-if="value === 'unknown'" class="logo-unknown" src="@/assets/classes/unknown.svg">
  <img v-else-if="value === 'warlord'" class="logo-warlord" src="@/assets/classes/warlord.svg">
  <img v-else-if="value === 'wizard'" class="logo-wizard" src="@/assets/classes/wizard.svg">
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({
  props: {
    value: { type: String },
  },
})
export default class ClassLogo extends Vue {}
</script>
