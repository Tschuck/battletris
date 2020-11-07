<template>
  <nav class="flex flex-wrap items-center justify-between p-3 bg-gray-900">
    <router-link to="/" class="flex items-center flex-shrink-0 text-white">
      <img width="42" height="42" src="@/assets/battletris.svg" />
      <span class="ml-6 text-xl font-semibold text-gray-100">{{
        $t("battletris")
      }}</span>
    </router-link>
    <div v-if="$route.name === 'room'">
      <span class="ml-6 text-xl font-semibold text-gray-100">></span>
      <span class="ml-6 text-xl font-semibold text-gray-100">{{
        roomName
      }}</span>
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
import { computed, SetupContext } from '@vue/composition-api';
import { Component, Vue } from 'vue-property-decorator';
import ClassLogo from './ClassLogo.vue';
import UserPreview from './UserPreview.vue';
import roomHandler from '../lib/RoomHandler';

@Component({
  components: {
    ClassLogo,
    UserPreview,
  },
  props: {
    loading: { type: Boolean },
  },
  setup(_, { root }: SetupContext) {
    const roomName = computed(() => {
      if (root?.$route?.params?.roomId) {
        return roomHandler.rooms.find(
          (room) => room.id === root.$route.params.roomId,
        )?.name;
      }
    });

    return { roomName };
  },
})
export default class RootNav extends Vue {}
</script>
