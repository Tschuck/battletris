<template>
  <nav class="flex flex-wrap items-center justify-between p-3 bg-gray-900">
    <div class="flex items-center flex-shrink-0 mr-6 text-white">
      <img width="42" height="42"  src="@/assets/battletris.svg">
      <span class="ml-6 text-xl font-semibold tracking-tight">{{ $t('battletris')}}</span>
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
