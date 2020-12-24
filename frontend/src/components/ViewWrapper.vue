<template>
  <div class="vh-100">
    <div class="fixed left-0 right-0 mt-6 text-center" v-if="showNav">
      <router-link :to="$route.query.back || backRoute">
        <font-awesome-icon class="text-4xl bounce" icon="chevron-up" />

        <p class="mt-5 font-bold text-center" v-if="title">{{ title }}</p>
      </router-link>
    </div>

    <div
      class="flex justify-center w-full py-16 overflow-y-auto vh-100"
      v-if="showNav"
      :class="{ 'pt-32': !!title }"
    >
      <div class="flex justify-center w-full h-full overflow-y-auto">
        <slot />
      </div>
    </div>
    <slot v-else />

    <QuickLinks v-if="showNav" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import QuickLinks from './QuickLinks.vue';

@Component({
  components: {
    QuickLinks,
  },
  props: {
    showNav: {
      type: Boolean,
      default: true,
    },
    backRoute: {
      type: String,
      default: '/mode',
    },
    title: {
      type: String,
      default: '',
    },
  },
})
export default class RootNav extends Vue {}
</script>
