<template>
  <div>
    <Loading v-if="loading" />
    <router-view v-else />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { ref } from '@vue/composition-api';

import user from './lib/User';
import Loading from './components/Loading.vue';

@Component({
  components: {
    Loading,
  },
  setup() {
    const loading = ref(true);
    user.init().then(() => loading.value = false);
    return { loading };
  },
})
export default class Home extends Vue {}
</script>

<style lang="postcss">
@tailwind base;
@tailwind components;
@tailwind utilities;
</style>
