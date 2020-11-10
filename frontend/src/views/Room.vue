<template>
  <div class="h-full">
    <Loading v-if="loading" />
    <div class="grid h-full grid-cols-4 gap-6" v-else>
      <div class="border-r border-gray-300 border-solid">
        <Chat />
      </div>
      <div class="col-span-3">
        <GameRegistration v-if="!room.isMatchRunning" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { ref } from '@vue/composition-api';
import { RoomWithDataInterface } from '@battletris/shared';

import RoomConnection from '../lib/RoomConnection';
import Loading from '../components/Loading.vue';
import Chat from '../components/Chat.vue';
import GameRegistration from '../components/GameRegistration.vue';

@Component({
  components: {
    Chat,
    Loading,
    GameRegistration,
  },
  props: {
    roomId: { type: String },
  },
  setup(props) {
    const loading = ref(true);
    const creating = ref(false);
    const room = ref<RoomWithDataInterface|null>(null);

    (async () => {
      // connect to the websocket
      const conn = await RoomConnection.connect(props.roomId as string);
      room.value = conn.room;
      loading.value = false;
    })();

    return {
      creating,
      loading,
      room,
    };
  },
})
export default class RoomComponent extends Vue {}
</script>
