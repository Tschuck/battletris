<template>
  <div class="container-fluid w-100 h-100">
    <div class="row h-100">

      <div class="col col-md-5 col-xl-3 h-100 d-flex flex-column overflow-hidden">
        <battletris-panel :room="'tavern'"></battletris-panel>
      </div>

      <div class="col col-md-7 col-xl-9 mt-md-0 h-100 py-2 overflow-auto">
        <loading v-if="loading || error" :error="error"></loading>
        <template v-else>
          <div class="container-fluid">
            <div class="row h-100">
              <div class="col-12 px-1">
                <div class="nes-container with-title">
                  <p class="title">
                    {{ 'tavern' | translate }}
                  </p>

                  {{ 'welcome' | translate }}...
                </div>
              </div>
            </div>

            <div class="row mt-2">
              <div class="col-md-6 col-lg-4 col-xl-3 mt-1 p-1"
                v-for="(room, index) in Object.keys(rooms)"
                v-if="room !== 'tavern'">
                <div class="nes-container with-title"
                  @click="$router.push({ path: `/battlefield/${ room }` })">
                  <p class="title">
                    {{ $t('battlefield', { index: parseInt(room.replace('field', '')) + 1 }) }}
                  </p>

                  <battletris-users
                    class="overflow-y"
                    style="height: 200px;"
                    :container="false"
                    :room="room"
                    :users="rooms[room].users">
                  </battletris-users>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
  import Component from './tavern';
  export default Component;
</script>
