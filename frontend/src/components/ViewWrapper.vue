<template>
  <div class="flex flex-col items-center overflow-y-auto" style="height: 100vh">
    <router-link class="absolute left-0 right-0 mt-6 text-center" :to="backRoute">
      <font-awesome-icon class="text-4xl bounce" icon="chevron-up" />
    </router-link>

    <slot />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({
  props: {
    backRoute: {
      type: String,
      default: '/mode',
    },
  },
})
export default class RootNav extends Vue {}
</script>
