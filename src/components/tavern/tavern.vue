<template>
  <div>
    <battletris-header :room="'tavern'"></battletris-header>
    <div class="w-100 mt-md-0 h-100"
      style="overflow-x: hidden; overflow-y: auto;">
      <loading v-if="loading || error" :error="error"></loading>
      <template v-else>
        <div class="container-fluid">
          <div class="card my-3">
            <div class="card-header">
              <h5>{{ 'tavern' | translate }}</h5>
            </div>
            <div class="card-body">
              {{ 'welcome' | translate }}
            </div>
          </div>
          <div class="row">
            <div class="col-md-6 col-lg-4 col-xl-3 mb-3"
              v-for="(room, index) in Object.keys(rooms)"
              v-if="room !== 'tavern'">
              <div class="card">
                <div class="card-header">
                  <h5>{{ $t('battlefield', { index: parseInt(room.replace('field', '')) + 1 }) }}</h5>
                  <button class="btn"
                    v-b-tooltip.hover
                    :title="$t('battle.join')"
                    @click="$router.push({ path: `/battlefield/${ room }` })">
                    <i class="mdi mdi-login-variant h4"></i>
                  </button>
                </div>

                <div class="card-body">
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
        </div>
      </template>
    </div>
  </div>
</template>

<script>
  import Component from './tavern';
  export default Component;
</script>
