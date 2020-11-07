<template>
  <nav class="flex flex-wrap items-center justify-between p-3 bg-gray-900">
    <div class="flex items-center flex-shrink-0 mr-6 text-white">
      <img width="42" height="42"  src="@/assets/battletris.svg">
      <span class="ml-6 text-xl font-semibold tracking-tight">{{ $t('battletris')}}</span>
    </div>
    <div class="block lg:hidden">
      <button
        class="flex items-center px-3 py-2 text-teal-200 border border-teal-400 rounded hover:text-white hover:border-white"
      >
        <svg
          class="w-3 h-3 fill-current"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>Menu</title>
          <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
        </svg>
      </button>
    </div>
    <div class="flex-grow block w-full lg:flex lg:items-center lg:w-auto">
      <div class="text-sm lg:flex-grow" />
      <div>
        <UserPreview v-if="!loading" />
      </div>
    </div>
  </nav>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import ClassLogo from './ClassLogo.vue';
import UserPreview from './UserPreview.vue';

@Component({
  components: {
    ClassLogo,
    UserPreview,
  },
  props: {
    loading: { type: Boolean },
  },
})
export default class RootNav extends Vue {}
</script>
