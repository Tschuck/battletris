<template>
  <div>
    <SorcererIcon v-if="className === 'sorcerer'" v-bind="$props" />
    <UnknownIcon v-if="className === 'unknown'" v-bind="$props" />
    <WarriorIcon v-if="className === 'warrior'" v-bind="$props" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import { iconProps } from './BaseIcon.vue';
import SorcererIcon from './sorcerer.vue';
import UnknownIcon from './unknown.vue';
import WarriorIcon from './warrior.vue';

@Component({
  components: {
    SorcererIcon,
    UnknownIcon,
    WarriorIcon,
  },
  props: {
    className: { type: String },
    ...iconProps,
  },
})
export default class RootNav extends Vue {}
</script>
