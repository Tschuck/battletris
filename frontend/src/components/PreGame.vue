<template>
  <div>

  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import user from '../lib/User';

@Component({
  props: {
    isOpen: { type: String },
  },
  setup() {
  },
})
export default class ClassLogo extends Vue {}
</script>
