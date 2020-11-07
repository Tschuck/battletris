<template>
  <div class="home">
    <Loading v-if="loading" />
    <div v-else>
      <div class="max-w-sm p-3 overflow-hidden rounded shadow-lg">
        <h2 class="mb-2 text-xl font-bold">{{ $t('whats-battletris') }}</h2>
        <p class="text-sm">{{ $t('welcome') }}</p>
        <div class="mt-3">
          <p class="text-sm" v-html="$t('whats-battletris-long')"></p>
        </div>
      </div>

      <div>
        <div>
          no match history available? Play a match or login with a exported
          battletris id.

          <div class="custom-file">
            <input
              accept=".json"
              class="custom-file-input"
              id="uploadIdRef"
              ref="uploadIdRef"
              type="file"
              @change="importUser()">
              <p class="text-danger" v-if="importError">
                invalid import
              </p>
            <label class="custom-file-label" for="uploadIdRef">
              import battletris id
            </label>
          </div>

          want to login again on an other machine?
          <button :disabled="workingOnBattletrisId" @click="user.export()">
            export battletris id
          </button>
        </div>

        <div>match history</div>
      </div>

      <div>
        <input
          v-model="name"
          placeholder="username"
          @input="setLocalStorage('battletris-name', name)"
        />
        <select v-model="selectedRoom">
          <option v-for="room in rooms" :key="room.id" :value="room.id">
            {{ room.name }}
          </option>
        </select>
        <router-link class="button" :to="`/${selectedRoom}`">join</router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { ref } from '@vue/composition-api';

import { disconnectLastConnection } from '../lib/RoomConnection';
import Loading from '../components/Loading.vue';
import user from '../lib/User';
import { getRequest } from '../lib/request';

@Component({
  components: {
    Loading,
  },
  setup() {
    const loading = ref(true);
    const creating = ref(false);
    const rooms = ref<any[] | null>(null);

    // user params
    const selectedRoom = ref('');
    const name = ref(user.name);
    const className = ref(user.className || 'unknown');

    const init = async () => {
      loading.value = true;
      // disconnect last connection
      disconnectLastConnection();
      // get room overview
      rooms.value = await getRequest('rooms');
      if (rooms.value && rooms.value.length !== 0) {
        selectedRoom.value = rooms.value[0].id;
      }
      loading.value = false;
    };
    init();

    // save name / class in localStorage
    const setLocalStorage = (key: string, value: string) => window.localStorage.setItem(key, value);

    // session import / export
    const workingOnBattletrisId = ref(false);
    const importError = ref(false);
    const uploadIdRef = ref<{ files: Blob[] }|null>(null);
    const importUser = async () => {
      loading.value = true;
      await user.import(uploadIdRef.value as { files: Blob[] });
      // use latest user data
      name.value = user.name;
      className.value = user.className;
      loading.value = false;
    };

    return {
      className,
      creating,
      rooms,
      importUser,
      importError,
      loading,
      name,
      selectedRoom,
      setLocalStorage,
      uploadIdRef,
      user,
      workingOnBattletrisId,
    };
  },
})
export default class Home extends Vue {}
</script>
