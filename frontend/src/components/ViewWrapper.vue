<template>
  <div class="flex flex-col">
    <nav class="flex flex-wrap items-center justify-between p-3 bg-gray-900" v-if="showHeader">
      <router-link to="/" class="flex items-center flex-shrink-0 text-white">
        <img width="42" height="42" src="battletris-light.svg" />
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
    <Loading v-if="loading" />
    <div class="overflow-y-auto" v-else
      :style="`height: ${showHeader ? 'calc(100vh - 63px)' : '100vh'}`">
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, SetupContext } from '@vue/composition-api';
import { Component, Vue } from 'vue-property-decorator';
import ClassLogo from './ClassLogo.vue';
import UserPreview from './UserPreview.vue';
import Loading from './Loading.vue';
import roomHandler from '../lib/RoomHandler';

@Component({
  components: {
    ClassLogo,
    Loading,
    UserPreview,
  },
  props: {
    loading: { type: Boolean },
    showHeader: { type: Boolean, default: true },
  },
  setup(_, { root }: SetupContext) {
    const roomName = computed(() => {
      if (root?.$route?.params?.roomId && roomHandler.rooms[root.$route.params.roomId]) {
        return roomHandler.rooms[root.$route.params.roomId].name;
      }
    });

    return { roomName };
  },
})
export default class RootNav extends Vue {}
</script>
