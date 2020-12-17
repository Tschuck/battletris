<template>
  <ViewWrapper>
    todo
  </ViewWrapper>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import ViewWrapper from '../components/ViewWrapper.vue';

@Component({
  components: {
    ViewWrapper,
  },
})
export default class SinglePlayer extends Vue {}
</script>
