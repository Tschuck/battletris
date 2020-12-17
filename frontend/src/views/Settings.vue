<template>
  <div class="flex flex-col">
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Loading from '../components/general/Loading.vue';

@Component({
  components: {
    Loading,
  },
})
export default class Settings extends Vue {}
</script>
