<template>
  <ViewWrapper :title="$t('room.join')">
    <Loading v-if="loading" />
    <div style="max-width: 1200px;" v-else>
      <div class="flex flex-row flex-wrap justify-center mt-8">
        <router-link
          class="flex-shrink-0 w-40 p-8 mb-2 mr-3 border rounded min-w-xs bg-hover-3 bg-2"
          v-for="room in rooms"
          :key="room.id"
          :value="room.id"
          :to="`/multi-player/${room.id}`"
        >
          <h3 class="text-xs font-bold">{{ room.name }}</h3>
          <i class="text-xs"
            >{{ room.connectionCount }} {{ $t("room.users-joined") }}</i
          >
          <i class="text-xs" v-if="room.isMatchRunning">{{
            $t("game.running")
          }}</i>
        </router-link>
      </div>
    </div>
  </ViewWrapper>
</template>

<script lang="ts">
import { ref } from '@vue/composition-api';
import { Component, Vue } from 'vue-property-decorator';
import ViewWrapper from '../components/ViewWrapper.vue';
import Loading from '../components/Loading.vue';
import { getRequest } from '../lib/request';

@Component({
  components: {
    ViewWrapper,
    Loading,
  },
  setup() {
    const loading = ref(true);
    const rooms = ref<any[] | null>(null);

    (async () => {
      rooms.value = await getRequest('rooms');
      loading.value = false;
    })();

    return {
      loading,
      rooms,
    };
  },
})
export default class MultiPlayer extends Vue {}
</script>
