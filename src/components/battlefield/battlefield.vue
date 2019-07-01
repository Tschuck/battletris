<template>
  <div class="container-fluid w-100 h-100">
    <div class="row h-100">
      <div class="col col-md-3 col-xl-3 h-100 d-flex flex-column overflow-hidden">
        <battletris-panel
          :room="room"
          :tavernLink="true">
        </battletris-panel>
      </div>

      <div class="col col-md-9 col-xl-9 mt-md-0 h-100 py-2 overflow-auto">
        <loading v-if="loading || error" :error="error"></loading>
        <template v-else>
          <div class="nes-container with-title w-100">
            <p class="title">
              {{ $t('battlefield', { index: parseInt(room.replace('field', '')) + 1 }) }}
            </p>

            <div class="container-fluid p-0 mt-3">
              <div class="row">
                <div class="col-6">
                  <p>
                    {{ `battle.status` | translate }}:
                    {{ battle.status }}

                    <template v-if="battle.status === 'starting'">
                      ({{ battle.startCounter }}s)
                    </template>
                  </p>
                  <template v-if="battle.status === 'started'">
                    <p>{{ 'battle.duration' | translate }}: {{ battle.duration }}s</p>
                  </template>
                </div>

                <div class="col-6 text-right">
                  <template v-if="battle.status !== 'started'">
                    <template v-if="!battle.users[connectionId]">
                      <button type="button" class="nes-btn is-primary"
                        @click="battle.status === 'starting' ?
                          setBattleStatus('accept') :
                          setBattleStatus('join')
                        ">
                        {{ 'battle.join' | translate }}
                      </button>
                    </template>

                    <template v-else>
                      <button type="button" class="nes-btn is-warning"
                        @click="setBattleStatus('leave')">
                        {{ 'battle.leave' | translate }}
                      </button>
                      <button type="button" class="nes-btn is-success"
                        @click="setBattleStatus('accept')"
                        v-if="!battle.accepted[connectionId]">
                        {{ 'battle.start' | translate }}
                      </button>
                    </template>
                  </template>

                  <template v-else>
                    <button type="button" class="nes-btn is-error"
                      @click="setBattleStatus('stop')">
                      {{ 'battle.stop' | translate }}
                    </button>
                  </template>
                </div>
              </div>
            </div>
          </div>
          <div class="container-fluid p-0 mt-3">
            <div class="row">
              <div class="col-6"
                v-if="battle.users[connectionId]">
                <div class="nes-container with-title w-100">
                  <p class="title">
                    {{ roomDetails.users[connectionId].name }}
                  </p>
                  
                  <div class="container-fluid px-0">
                    <div class="row">
                      <div class="col-6 mt-3">
                        <battletris-map
                          @init="battleMaps[connectionId] = $event">
                        </battletris-map>
                      </div>
                      <div class="col-6 mt-3">
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div :class="{
                  'col-12': !battle.users[connectionId],
                  'col-6': battle.users[connectionId],
                }">
                <div class="container-fluid px-0">
                  <div class="row">
                    <div
                      class="mb-3"
                      :class="{
                        'col-6': battle.users[connectionId],
                        'col-4': !battle.users[connectionId],
                      }"
                      v-for="(userId, index) in [ ].concat(
                        Object.keys(battle.users),
                        fillUserCounter
                      )"
                      v-if="!userId || userId !== connectionId">
                      <div class="nes-container">
                        <p class="title" v-if="userId && roomDetails.users">
                          {{ roomDetails.users[userId].name }}
                        </p>
                        <p class="title" v-else>
                          {{ $t('user', { index: index + 1 }) }}
                        </p>

                        <div class="container-fluid p-0">
                          <div class="row">
                            <div class="col-6">
                              <battletris-map
                                class="w-100"
                                @init="battleMaps[connectionId] = $event">
                              </battletris-map>
                            </div>
                            <div class="col-6"
                              v-if="userId">
                              <div>
                                {{ 'battle.status' | translate }}:
                                {{ (battle.accepted[userId] ? 'battle.accepted' : 'battle.accepting') | translate }}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
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
  import Component from './battlefield';
  export default Component;
</script>
