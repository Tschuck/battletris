<template>
  <div class="home">
    <Loading v-if="loading" />
    <div v-else>
      {{ game }}
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { ref } from '@vue/composition-api';
import axios from 'axios';

import Loading from '@/components/Loading.vue';
import config from '../config';

@Component({
  components: {
    Loading,
  },
  props: {
    gameName: { type: String },
  },
  setup(props, { root }) {
    const loading = ref(true);
    const creating = ref(false);
    const game = ref<any | null>(null);

    (async () => {
      const { data: { game: gameData } } = await axios.get(
        `${config.serverUrl}/game/${props.gameName}`,
      );
      game.value = gameData;
      loading.value = false;
    })();

    return {
      creating,
      game,
      loading,
    };
  },
})
export default class Home extends Vue {}
</script>
