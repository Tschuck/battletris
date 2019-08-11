<template>
  <div class="h-100 d-flex flex-column">
    <battletris-loading v-if="loading || error" :error="error"></battletris-loading>
    <template v-else>
      <battletris-header
        :room="'tavern'"
        :users="rooms.tavern.users">
      </battletris-header>
      <div class="d-flex w-100 h-100">
        <div class="p-3 w-100 h-100" style="min-width: 350px; width: 350px;">
          <battletris-chat :room="'tavern'"></battletris-chat>
        </div>
        <div class="h-100 overflow-auto p-3">
          <div class="card mb-3">
            <div class="card-header">
              <h5>{{ 'tavern' | translate }}</h5>
            </div>
            <div class="card-body">
              {{ 'welcome' | translate }}
            </div>
          </div>
          <div class="row overflow-auto">
            <div class="col-md-6 col-lg-4 col-xl-3 mb-3"
              v-for="(room, index) in Object.keys(rooms)"
              v-if="room !== 'tavern'">
              <div class="card">
                <div class="card-header">
                  <span>{{ $t('battlefield', { index: parseInt(room.replace('field', '')) + 1 }) }}</span>
                  <div>
                    <small
                      v-b-tooltip.hover
                      :title="$t('members')">
                      {{ Object.keys(rooms[room].users).length }}
                    </small>
                    <button class="btn p-0 ml-1"
                      v-b-tooltip.hover
                      :title="$t('battle.join')"
                      @click="$router.push({ path: `/battlefield/${ room }` })">
                      <i class="mdi mdi-login-variant h4"></i>
                    </button>
                  </div>
                </div>
                <div class="card-body p-0" style="height: 200px">
                  <ul class="list-group overflow-auto">
                    <li class="list-group-item"
                      v-for="(connectionId, index) in Object.keys(rooms[room].users)">
                      {{ rooms[room].users[connectionId].name }}
                      ({{ `classes.${ rooms[room].users[connectionId].className }.title`  | translate }})
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
  import Component from './tavern';
  export default Component;
</script>
